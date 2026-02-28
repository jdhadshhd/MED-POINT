// Simple client-side validation for register form
// Shows custom error if passwords do not match

document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('form[action="/auth/register"]');
  if (!form) return;

  var password = form.querySelector('#password');
  var confirmPassword = form.querySelector('#confirmPassword');

  form.addEventListener('submit', function(e) {
    // Password match check
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Passwords do not match');
      confirmPassword.reportValidity();
      e.preventDefault();
      return false;
    } else {
      confirmPassword.setCustomValidity('');
    }
  });

  // Remove custom error on input
  confirmPassword.addEventListener('input', function() {
    confirmPassword.setCustomValidity('');
  });
});
