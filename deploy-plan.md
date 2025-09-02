# Self-Hosted Terminal Portfolio Deployment Plan

This plan will help you deploy the Terminal Portfolio application on your Linux PC with both frontend and backend running locally, exposed through a single Cloudflare tunnel.

## Architecture Overview

```
Internet → Cloudflare Tunnel → Nginx (Port 80) → Frontend (Port 3000)
                                              ↘ Backend (Port 3001)
                                                    ↓
                                              Docker-in-Docker
                                              (Session Containers)
```

## Prerequisites

1. Linux PC with:
   - Docker installed
   - Docker Compose installed
   - Git installed
   - At least 4GB RAM available
   - Port 80 available

2. Cloudflare account with a domain

## Step 1: Clone and Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/twaldin/term-site.git
cd term-site

# Switch to the self-hosted branch
git checkout self-hosted-docker

# Create environment file
cat > .env << EOF
# Cloudflare Tunnel Token (will be added after creating tunnel)
TUNNEL_TOKEN=

# Frontend configuration (optional - defaults will work)
NEXT_PUBLIC_API_URL=
EOF
```

## Step 2: Build the Terminal Container Image

```bash
# Build the portfolio container that users will connect to
cd container
docker build -t twaldin/terminal-portfolio:latest .
cd ..
```

## Step 3: Update Container with Your Projects

Edit `container/Dockerfile` to add your projects:

```dockerfile
# Around line 100, update the git clone commands:
RUN su - portfolio -c "cd ~/projects && git clone https://github.com/twaldin/term-site.git"
RUN su - portfolio -c "cd ~/projects && git clone https://github.com/twaldin/dotfiles.git"
RUN su - portfolio -c "cd ~/projects && git clone https://github.com/twaldin/stm32-games.git"
RUN su - portfolio -c "cd ~/projects && git clone https://github.com/twaldin/sulfur-recipies.git"

# Copy nvim config from dotfiles
RUN su - portfolio -c "cp -r ~/projects/dotfiles/nvim ~/.config/"
```

Then rebuild:
```bash
cd container
docker build -t twaldin/terminal-portfolio:latest .
cd ..
```

## Step 4: Install Cloudflare Tunnel

```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Login to Cloudflare
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create term-site

# Get the tunnel credentials (save this output!)
cloudflared tunnel info term-site
```

## Step 5: Configure Cloudflare Tunnel

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USER/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Main application
  - hostname: term.yourdomain.com
    service: http://localhost:80
  # Catch-all
  - service: http_status:404
```

## Step 6: Add DNS Record in Cloudflare

1. Go to Cloudflare Dashboard → Your Domain → DNS
2. Add a CNAME record:
   - Name: `term` (or your chosen subdomain)
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy: Enabled (orange cloud)

## Step 7: Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services are running
docker ps
curl http://localhost/health
```

## Step 8: Start Cloudflare Tunnel

Option A: Run manually:
```bash
cloudflared tunnel run term-site
```

Option B: Run as systemd service:
```bash
# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

Option C: Use Docker Compose (add tunnel token to .env):
```bash
# Get your tunnel token
cloudflared tunnel token term-site

# Add to .env file
echo "TUNNEL_TOKEN=YOUR_TOKEN_HERE" >> .env

# Restart docker-compose
docker-compose up -d
```

## Step 9: Create Systemd Service (Optional)

Create `/etc/systemd/system/term-portfolio.service`:

```ini
[Unit]
Description=Terminal Portfolio Application
After=docker.service
Requires=docker.service

[Service]
Type=forking
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USER/term-site
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=YOUR_USER

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable term-portfolio
sudo systemctl start term-portfolio
```

## Step 10: Security Hardening

1. **Firewall Configuration**:
```bash
# Only allow Cloudflare IPs to port 80
sudo ufw allow from 173.245.48.0/20 to any port 80
sudo ufw allow from 103.21.244.0/22 to any port 80
sudo ufw allow from 103.22.200.0/22 to any port 80
sudo ufw allow from 103.31.4.0/22 to any port 80
sudo ufw allow from 141.101.64.0/18 to any port 80
sudo ufw allow from 108.162.192.0/18 to any port 80
sudo ufw allow from 190.93.240.0/20 to any port 80
sudo ufw allow from 188.114.96.0/20 to any port 80
sudo ufw allow from 197.234.240.0/22 to any port 80
sudo ufw allow from 198.41.128.0/17 to any port 80
sudo ufw allow from 162.158.0.0/15 to any port 80
sudo ufw allow from 104.16.0.0/13 to any port 80
sudo ufw allow from 104.24.0.0/14 to any port 80
sudo ufw allow from 172.64.0.0/13 to any port 80
sudo ufw allow from 131.0.72.0/22 to any port 80
```

2. **Docker Security**:
- Containers run with limited capabilities
- Network isolation (no network for session containers)
- Resource limits (CPU, memory, PIDs)
- Read-only root filesystem where possible

3. **Rate Limiting**:
- Backend includes session limits (10 concurrent)
- 15-minute timeout for inactive sessions

## Monitoring and Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Monitor Docker containers
docker stats

# Check tunnel status
cloudflared tunnel info term-site
```

## Troubleshooting

### Issue: WebSocket connection fails
- Check nginx configuration for proper WebSocket headers
- Ensure Cloudflare WebSocket support is enabled (it is by default)

### Issue: Containers can't start
- Check Docker daemon is running: `sudo systemctl status docker`
- Check disk space: `df -h`
- Check Docker logs: `journalctl -u docker`

### Issue: Cloudflare tunnel not connecting
- Verify tunnel credentials are correct
- Check firewall isn't blocking outbound connections
- Try running tunnel manually to see errors: `cloudflared tunnel run term-site`

### Issue: High resource usage
- Limit concurrent sessions in backend/session.js
- Adjust container resource limits in docker-compose.yml
- Implement cleanup cron job:
```bash
# Add to crontab
*/30 * * * * docker system prune -f
```

## Maintenance

### Update the application:
```bash
cd term-site
git pull
docker-compose build
docker-compose up -d
```

### Backup:
```bash
# Backup Docker volumes
docker run --rm -v term-site_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/docker-backup.tar.gz /data
```

### Clean up old containers:
```bash
docker system prune -a
```

## Environment Variables Reference

- `TUNNEL_TOKEN`: Cloudflare tunnel authentication token
- `NEXT_PUBLIC_API_URL`: Override API URL (optional, defaults to same origin)
- `NODE_ENV`: Set to 'production' for production deployment
- `FRONTEND_URL`: Backend CORS origin (handled by docker-compose)

## Notes

1. The application uses Docker-in-Docker for session isolation
2. Each user session gets its own Docker container
3. Projects are pre-cloned in the container image for faster startup
4. Nvim configuration is copied from your dotfiles repository
5. The setup assumes you're running on a dedicated Linux machine

## Support

For issues or questions:
- Check logs first: `docker-compose logs`
- GitHub Issues: https://github.com/twaldin/term-site/issues
- Ensure all prerequisites are met before deployment