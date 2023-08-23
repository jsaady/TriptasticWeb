export async function setupSW () {
  if ('serviceWorker' in navigator) {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker
        .register(new URL('./worker.ts', import.meta.url), { scope: '.', type: 'module' })
        .catch(err => {
          console.log('ServiceWorker registration falled: ', err);
          throw err;
        });
    } else {
      await registration.update();
    }
    
    

    navigator.serviceWorker.addEventListener('message', (ev) => console.log(ev));
    console.log('registered my big bro');
  }
}

