document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newMessage = {
      id: 'MSG-' + Date.now(),
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      date: new Date().toISOString(),
      status: 'Unread'
    };

    // Load existing messages or start with empty array
    const messages = JSON.parse(localStorage.getItem('kathyMessages')) || [];

    // Add new message
    messages.push(newMessage);

    // Save back to localStorage
    localStorage.setItem('kathyMessages', JSON.stringify(messages));

    // Show success, reset form
    successMessage.style.display = 'block';
    form.reset();

    // Optionally hide message after 5 seconds
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 5000);
  });
});
