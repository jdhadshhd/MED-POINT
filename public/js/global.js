document.addEventListener('DOMContentLoaded', function() {
  // Modal logic for Add Patient
  var addPatientBtn = document.getElementById('addPatientBtn');
  var addPatientModal = document.getElementById('addPatientModal');
  var closeAddPatientModal = document.getElementById('closeAddPatientModal');
  var cancelAddPatient = document.getElementById('cancelAddPatient');

  if (addPatientBtn && addPatientModal) {
    addPatientBtn.addEventListener('click', function() {
      addPatientModal.classList.remove('hidden');
    });
  }
  if (closeAddPatientModal && addPatientModal) {
    closeAddPatientModal.addEventListener('click', function() {
      addPatientModal.classList.add('hidden');
    });
  }
  if (cancelAddPatient && addPatientModal) {
    cancelAddPatient.addEventListener('click', function() {
      addPatientModal.classList.add('hidden');
    });
  }
  // Optional: close modal when clicking outside modal-content
  if (addPatientModal) {
    addPatientModal.addEventListener('click', function(e) {
      if (e.target === addPatientModal) {
        addPatientModal.classList.add('hidden');
      }
    });
  }
});
