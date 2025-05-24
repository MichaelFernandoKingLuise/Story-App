class NotFoundPage {
  async render(container) {
    container.innerHTML = `
      <section class="container" style="text-align:center; padding: 60px 0;">
        <h1 style="font-size:3rem; color: #2e3b4e;">404</h1>
        <h2 style="margin-bottom: 16px;">Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a href="#/" class="btn" style="margin-top:24px; display:inline-block; background:#2e3b4e; color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:500;">Back to Home</a>
      </section>
    `;
  }
  async afterRender() {}
}
export default NotFoundPage;
