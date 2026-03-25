import { notFound, redirect } from 'next/navigation'
import { Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { ExampleBlock } from '../../_lib/ExampleBlock'
import { getAtomDoc } from '../../_lib/atom-docs'
import { VariantRegistry } from '../../_lib/VariantRegistry'

export function generateStaticParams() {
  return getAllSlugs('atoms').map((slug) => ({ slug }))
}

export default async function AtomsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (slug === 'form-controls') {
    redirect('/system/ui/atoms/text-field')
  }

  if (slug === 'tabs-and-tooltips') {
    redirect('/system/ui/atoms/tabs')
  }

  const item = getLibraryItem('atoms', slug)
  const doc = getAtomDoc(slug)

  if (!item || !doc) notFound()

  return (
    <DetailPage item={item}>
      <ContentSection heading="When to use">
        <Text as="p" size="3" color="gray" className="leading-relaxed">
          {doc.whenToUse}
        </Text>
      </ContentSection>

      {doc.hardRules && doc.hardRules.length > 0 && (
        <ContentSection heading="Hard rules">
          <ul className="ml-5 flex list-disc flex-col gap-2">
            {doc.hardRules.map((rule) => (
              <li key={rule}>
                <Text as="span" size="2" color="gray">
                  {rule}
                </Text>
              </li>
            ))}
          </ul>
        </ContentSection>
      )}

      {doc.registry && doc.registry.length > 0 && (
        <ContentSection heading="Cedar registry">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            These are the Cedar shorthand references for this atom family. This is the layer you should be able to cite when composing a new fragment or custom component brief.
          </Text>
          <VariantRegistry rows={doc.registry} />
        </ContentSection>
      )}

      <ContentSection heading="Examples">
        {doc.examples.map((example) => (
          <ExampleBlock
            key={example.title}
            title={example.title}
            size={example.size}
            code={example.code}
          >
            {example.render()}
          </ExampleBlock>
        ))}
      </ContentSection>

      {doc.notes && doc.notes.length > 0 && (
        <ContentSection heading="Notes">
          <ul className="ml-5 flex list-disc flex-col gap-2">
            {doc.notes.map((note) => (
              <li key={note}>
                <Text as="span" size="2" color="gray">
                  {note}
                </Text>
              </li>
            ))}
          </ul>
        </ContentSection>
      )}
    </DetailPage>
  )
}
