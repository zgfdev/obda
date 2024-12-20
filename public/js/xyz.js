function sendReq(url) {
  fetch(url, { method: 'GET' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Response data:', data);
    })
    .catch((error) => {
      console.error('Error during fetch:', error);
    });
}
