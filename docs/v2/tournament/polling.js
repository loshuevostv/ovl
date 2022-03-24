var startPolling = (url, cb) => {
  return setInterval(() => {
    fetch(new Request(url)).then(response => response.json().then(data => cb(data)));
  }, 1000);
};