$(document).ready(function () {
  // Function to validate form fields
  function validateField(selector, condition, message) {
    $(selector).on('input change', function () {
      if (condition($(this).val())) {
        $(this).css('border-color', 'red');
        $(this).next('.error-message').text(message).show();
      } else {
        $(this).css('border-color', '');
        $(this).next('.error-message').hide();
      }
    });
  }

  // Validate Product Name
  validateField(
    '#name',
    (val) => val.trim() === '',
    'Product name is required.',
  );

  // Validate Brand
  validateField('#brand', (val) => val.trim() === '', 'Brand is required.');

  // Validate Price
  validateField(
    '#price',
    (val) => val <= 0,
    'Price must be greater than zero.',
  );

  // Validate Category
  validateField('#category', (val) => val === '', 'Category is required.');

  // Validate Size
  validateField('#size', (val) => val === '', 'Size is required.');

  // Validate Photo
  validateField('#photo', (val) => val === '', 'Photo is required.');

  // Validate Expiry Date
  validateField(
    '#expiryDate',
    (val) => new Date(val) < new Date(),
    'Expiry date cannot be in the past.',
  );

  // Function to validate the entire form before submission
  function validateForm() {
    let hasError = false;
    // Validate each field again before form submission
    $('input, select').each(function () {
      const condition = $(this).data('condition');
      const message = $(this).data('message');
      if (condition && message && condition($(this).val())) {
        $(this).css('border-color', 'red');
        $(this).next('.error-message').text(message).show();
        hasError = true;
      }
    });

    return !hasError;
  }

  // AJAX form submission for adding a product
  $('#addProductForm').submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    // Perform the final validation check
    if (!validateForm()) {
      $('.form-message')
        .text('Please fix the errors in the form before submitting.')
        .css('color', 'red')
        .show();
      return; // Stop the form submission
    }

    var formData = new FormData(this); // Create FormData object to send form data including files

    // Fetch the token from local storage
    var token = localStorage.getItem('token');

    $.ajax({
      url: '/api/v1/products',
      type: 'POST',
      data: formData,
      headers: {
        Authorization: 'Bearer ' + token, // Include the token in the request headers
      },
      contentType: false, // Important! Don't set contentType
      processData: false, // Important! Don't process the data
      success: function (response) {
        console.log(response); // Log the response for debugging

        if (response.status === 'success') {
          // Show success message to user
          $('.form-message')
            .text('Product created successfully!')
            .css('color', 'green')
            .show();
        } else {
          // Show error message to user if needed
          $('.form-message')
            .text('Failed to create product. Please try again.')
            .css('color', 'red')
            .show();
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText); // Log detailed error message
        $('.form-message')
          .text('Failed to create product. Please try again.')
          .css('color', 'red')
          .show();
      },
    });
  });

  // Redirect to dashboard on button click
  $('#backToDashboardBtn').click(function (event) {
    event.preventDefault(); // Prevent default link behavior if needed

    // Redirect to the dashboard page
    window.location.href = '/dashboard';
  });

  // Attach conditions and messages to fields for final validation check
  $('#name')
    .data('condition', (val) => val.trim() === '')
    .data('message', 'Product name is required.');
  $('#brand')
    .data('condition', (val) => val.trim() === '')
    .data('message', 'Brand is required.');
  $('#price')
    .data('condition', (val) => val <= 0)
    .data('message', 'Price must be greater than zero.');
  $('#category')
    .data('condition', (val) => val === '')
    .data('message', 'Category is required.');
  $('#size')
    .data('condition', (val) => val === '')
    .data('message', 'Size is required.');
  $('#photo')
    .data('condition', (val) => val === '')
    .data('message', 'Photo is required.');
  $('#expiryDate')
    .data('condition', (val) => new Date(val) < new Date())
    .data('message', 'Expiry date cannot be in the past.');
});

// $(document).ready(function () {
//   // Function to validate form fields
//   function validateField(selector, condition, message) {
//     $(selector).on('input change', function () {
//       if (condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//       } else {
//         $(this).css('border-color', '');
//         $(this).next('.error-message').hide();
//       }
//     });
//   }

//   // Validate Product Name
//   validateField(
//     '#name',
//     (val) => val.trim() === '',
//     'Product name is required.',
//   );

//   // Validate Brand
//   validateField('#brand', (val) => val.trim() === '', 'Brand is required.');

//   // Validate Price
//   validateField(
//     '#price',
//     (val) => val <= 0,
//     'Price must be greater than zero.',
//   );

//   // Validate Category
//   validateField('#category', (val) => val === '', 'Category is required.');

//   // Validate Size
//   validateField('#size', (val) => val === '', 'Size is required.');

//   // Validate Photo
//   validateField('#photo', (val) => val === '', 'Photo is required.');

//   // Validate Expiry Date
//   validateField(
//     '#expiryDate',
//     (val) => new Date(val) < new Date(),
//     'Expiry date cannot be in the past.',
//   );

//   // AJAX form submission for adding a product
//   $('#addProductForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Check if there are any validation errors
//     let hasError = false;
//     $('input, select').each(function () {
//       if ($(this).css('border-color') === 'red') {
//         hasError = true;
//         return false; // Break the loop
//       }
//     });

//     if (hasError) {
//       $('.form-message')
//         .text('Please fix the errors in the form before submitting.')
//         .css('color', 'red')
//         .show();
//       return; // Stop the form submission
//     }

//     var formData = new FormData(this); // Create FormData object to send form data including files

//     // Fetch the token from local storage
//     var token = localStorage.getItem('token');

//     $.ajax({
//       url: '/api/v1/products',
//       type: 'POST',
//       data: formData,
//       headers: {
//         Authorization: 'Bearer ' + token, // Include the token in the request headers
//       },
//       contentType: false, // Important! Don't set contentType
//       processData: false, // Important! Don't process the data
//       success: function (response) {
//         console.log(response); // Log the response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product created successfully!')
//             .css('color', 'green')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to create product. Please try again.')
//             .css('color', 'red')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to create product. Please try again.')
//           .css('color', 'red')
//           .show();
//       },
//     });
//   });

//   // Redirect to dashboard on button click
//   $('#backToDashboardBtn').click(function (event) {
//     event.preventDefault(); // Prevent default link behavior if needed

//     // Redirect to the dashboard page
//     window.location.href = '/dashboard';
//   });
// });

// $(document).ready(function () {
//   // Function to validate form fields
//   function validateField(selector, condition, message) {
//     $(selector).on('input change', function () {
//       if (condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//       } else {
//         $(this).css('border-color', '');
//         $(this).next('.error-message').hide();
//       }
//     });
//   }

//   // Validate Product Name
//   validateField(
//     '#name',
//     (val) => val.trim() === '',
//     'Product name is required.',
//   );

//   // Validate Brand
//   validateField('#brand', (val) => val.trim() === '', 'Brand is required.');

//   // Validate Price
//   validateField(
//     '#price',
//     (val) => val <= 0,
//     'Price must be greater than zero.',
//   );

//   // Validate Category
//   validateField('#category', (val) => val === '', 'Category is required.');

//   // Validate Size
//   validateField('#size', (val) => val === '', 'Size is required.');

//   // Validate Photo
//   validateField('#photo', (val) => val === '', 'Photo is required.');

//   // AJAX form submission for adding a product
//   $('#addProductForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Check if there are any validation errors
//     let hasError = false;
//     $('input, select').each(function () {
//       if ($(this).css('border-color') === 'red') {
//         hasError = true;
//         return false; // Break the loop
//       }
//     });

//     if (hasError) {
//       $('.form-message')
//         .text('Please fix the errors in the form before submitting.')
//         .css('color', 'red')
//         .show();
//       return; // Stop the form submission
//     }

//     var formData = new FormData(this); // Create FormData object to send form data including files

//     // Fetch the token from local storage
//     var token = localStorage.getItem('token');

//     $.ajax({
//       url: '/api/v1/products',
//       type: 'POST',
//       data: formData,
//       headers: {
//         Authorization: 'Bearer ' + token, // Include the token in the request headers
//       },
//       contentType: false, // Important! Don't set contentType
//       processData: false, // Important! Don't process the data
//       success: function (response) {
//         console.log(response); // Log the response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product created successfully!')
//             .css('color', 'green')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to create product. Please try again.')
//             .css('color', 'red')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to create product. Please try again.')
//           .css('color', 'red')
//           .show();
//       },
//     });
//   });

//   // Redirect to dashboard on button click
//   $('#backToDashboardBtn').click(function (event) {
//     event.preventDefault(); // Prevent default link behavior if needed

//     // Redirect to the dashboard page
//     window.location.href = '/dashboard';
//   });
// });
