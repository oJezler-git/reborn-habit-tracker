/**
 * App-level constants — edit here, changes propagate everywhere.
 */

// ── Version ──────────────────────────────────────────────────────────────────
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "dev";

// Edit APP_VERSION in package.json
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
export const APP_RELEASE_LABEL = `v${APP_VERSION} Alpha`;

// ── Identity ──────────────────────────────────────────────────────────────────
export const APP_NAME = "REBORN";
export const APP_NAME_DISPLAY = "Reborn"; // sentence-case for prose
export const APP_TAGLINE = "REBORN: An intelligent habit tracker.";

// ── Author ────────────────────────────────────────────────────────────────────
export const AUTHOR_NAME = "Jezler";
export const AUTHOR_HANDLE = "oJezler-git";
export const AUTHOR_ROLE = "Developer";
export const AUTHOR_GITHUB_URL = `https://github.com/${AUTHOR_HANDLE}`;
export const AUTHOR_DISCORD_URL = `https://discord.com/users/755820225991016610`;
export const REPO_SSH = `git@github.com:${AUTHOR_HANDLE}/reborn.git`;
