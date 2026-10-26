# Administrator registration

At `/register`, select **Admin**, then provide an email address and password. The existing `/auth/register` endpoint validates the requested role, hashes the password, and returns a token for the created account. Admin sign-in at `/login` uses the same email/password login endpoint and confirms the returned role.

**Security note:** Admin registration is open to anyone who can access the app. Anyone can create an account with Admin privileges and use the workspace reporting endpoint. Do not expose this configuration publicly if Admin access is meant to be restricted.
