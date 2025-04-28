import Image from 'next/image'

export default async function Home() {
  return (
    <div>
      <Image
        src="/images/Banner.jpg"
        width={2000}
        height={500}
        objectFit='contain'
        alt="Picture of the author"
      />
    </div>
  );
}
