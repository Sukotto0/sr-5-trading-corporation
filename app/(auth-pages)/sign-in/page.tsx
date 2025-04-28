import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
    <div className='flex flex-col items-center w-screen'>
      <div>
        <Image
          src="/images/Banner.jpg"
          width={2000}
          height={500}
          objectFit='contain'
          alt="Picture of the author"
        />
      </div>
      <div className='absolute bg-black/30 w-screen h-screen top-0 left-0'>
        <div className='absolute top-1/2 left-1/2 -translate-1/2 '><SignIn /></div>
      </div>
    </div>
  )
}