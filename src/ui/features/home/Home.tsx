import { Dropdown } from '../../components/Dropdown.js';
import { useAuthorization } from '../../utils/useAuth.js';

export const Home = () => {
  const auth = useAuthorization();

  return <div className='flex flex-col items-center justify-center'>
    <h1 className='text-4xl'>Welcome to the template app</h1>
    <p className='text-xl'>This is a template app for React, Typescript, Tailwind, and Webpack.</p>
    <p className='text-xl'>It includes a basic authentication flow, and a few other features.</p>
    <p className='text-xl'>You can find the source code <a href=''>here</a></p>
  </div>
};
