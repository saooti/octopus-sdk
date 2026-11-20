/**
 * Logs out with a POST to `/logout`. The backends only accept POST there, so
 * a cross-site link or redirect to `/logout` (a GET) can't log users out
 * (security-log 2.6). The backend redirects afterwards (Keycloak, then home).
 */
export default {
    logout(): void {
        const form = document.createElement("form");
        form.method = "post";
        form.action = "/logout";
        form.hidden = true;
        document.body.appendChild(form);
        form.submit();
    }
};
