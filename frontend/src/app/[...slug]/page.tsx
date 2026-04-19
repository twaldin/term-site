// Catch-all route: every URL path that isn't the root renders the same
// terminal page. The websocket client reads window.location.pathname and
// sends it as an initCommand, so /blog/my-post auto-types `blog my-post`,
// /projects/flt auto-types `projects flt`, /about auto-types `about`, etc.
//
// Re-exports the home page to avoid duplicating the terminal setup.
export { default } from '../page';
