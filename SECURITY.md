# Security Policy

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

We take security seriously. Although AllYourTypes is a 100% client-side application (no server, no data uploads), we still want to ensure the code is safe for users.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email **security@veinpal.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Assessment**: Within 1 week, we'll assess severity and impact
- **Resolution**: Critical vulnerabilities patched within 72 hours
- **Disclosure**: Coordinated disclosure after the fix is deployed

### Scope

**In scope:**

- Cross-site scripting (XSS) via crafted image files
- Supply chain vulnerabilities in dependencies
- Information leakage through converted image metadata
- Malicious code injection through SVG processing
- Canvas API exploitation via crafted inputs

**Out of scope:**

- Social engineering attacks
- Denial of service (client-side performance)
- Issues in third-party dependencies (report upstream)
- Browser-specific bugs not related to our code

### Recognition

We gratefully acknowledge security researchers who report vulnerabilities responsibly. With your permission, we'll add your name to our security acknowledgments.
