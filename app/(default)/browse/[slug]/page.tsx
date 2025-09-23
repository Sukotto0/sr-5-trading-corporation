export default async function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
    const {slug} = await params;
    console.log(slug)
  return <></>;
}
