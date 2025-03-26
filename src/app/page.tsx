import { AuthOptions } from "@/components/shared/navbar/auth-options";
import { Navbar } from "@/components/shared/navbar/nav-bar";
import { NavLinks } from "@/components/shared/navbar/nav-links";
import { Publiclinks } from "@/lib/config/constants";


export default function Home() {
  return (
    <main className="w-full h-full bg-neutral-100">
      <Navbar
        className='bg-primary text-white'
      >
        <NavLinks
          type='Public'
          links={Publiclinks}
          className='text-sm px-6 py-2 font-Rubik-Medium bg-primary rounded-full hover:bg-neutral-700'
        />

        <div className='flex justify-start items-center gap-x-4 '>
          <AuthOptions
            Options={[{ name: 'Sign in to drive & deliver', type: 'Driver' }, { name: 'Sign in ride', type: 'Rider' },]}
            path='login'
            name='Log in'
          />
          <AuthOptions
            Options={[{ name: 'Sign in to drive & deliver', type: 'Driver' }, { name: 'Create a rider account', type: 'Rider' },]}
            path='signup'
            name='Sign up'
            className='bg-white hover:bg-white text-primary'
          />
        </div>
      </Navbar>
    </main>
  );
}
