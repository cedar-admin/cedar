import { Badge, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import { getLibraryGroup } from '../_lib/nav-config'
import { LibraryIndexCard } from '../_lib/LibraryIndexCard'
import { ATOM_FAMILIES, getAtomIndexPreview } from '../_lib/atom-docs'

export default function AtomsIndexPage() {
  const group = getLibraryGroup('atoms')
  if (!group) return null

  const hrefFor = (slug: string) => `${group.basePath}/${slug}`
  const items = Object.fromEntries(group.items.map((item) => [item.slug, item]))

  return (
    <Flex direction="column" gap="8">
      <Flex direction="column" gap="3">
        <Heading as="h1" size="6" weight="bold">Atom components</Heading>
        <Text as="p" size="3" color="gray" className="max-w-4xl leading-relaxed">
          This catalog is Cedar’s browseable atom layer: every Radix Themes atom Cedar can use directly, plus the Cedar-approved naming and contract for the atoms we rely on most. If you want to know what the product can be built from, start here. If you want to know how Cedar composes those atoms into real interface pieces, continue into Fragments and UI patterns.
        </Text>
      </Flex>

      <Flex wrap="wrap" gap="2">
        <Badge variant="soft" color="green">Approved = current Cedar contract</Badge>
        <Badge variant="soft" color="amber">Candidate = available now, not fully normalized everywhere</Badge>
        <Badge variant="soft" color="blue">Experimental = available, use deliberately</Badge>
      </Flex>

      {ATOM_FAMILIES.map((family) => (
        <Flex key={family.label} direction="column" gap="4">
          <Heading as="h2" size="4" weight="medium">
            {family.label}
          </Heading>
          <Grid columns={{ initial: '1', md: '2' }} gap="5">
            {family.slugs.map((slug) => {
              const item = items[slug]
              if (!item) return null

              return (
                <LibraryIndexCard
                  key={slug}
                  href={hrefFor(slug)}
                  label={item.label}
                  referenceId={item.referenceId}
                  description={item.description}
                  status={item.status}
                  preview={getAtomIndexPreview(slug)}
                />
              )
            })}
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}
