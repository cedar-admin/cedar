import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  CheckboxCards,
  DataList,
  Flex,
  Grid,
  Heading,
  IconButton,
  Progress,
  RadioCards,
  ScrollArea,
  SegmentedControl,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { getLibraryGroup } from '../_lib/nav-config'
import { LibraryIndexCard } from '../_lib/LibraryIndexCard'
import { CedarTable } from '@/components/CedarTable'

const RADIX_ATOM_CATEGORIES = [
  {
    label: 'Actions and navigation',
    items: ['Button', 'IconButton', 'Badge', 'Tabs', 'TabNav', 'Tooltip', 'DropdownMenu', 'ContextMenu'],
  },
  {
    label: 'Inputs and selection',
    items: ['TextField', 'TextArea', 'Select', 'Checkbox', 'CheckboxCards', 'Radio', 'RadioGroup', 'RadioCards', 'Switch', 'Slider', 'SegmentedControl'],
  },
  {
    label: 'Data and feedback',
    items: ['Table', 'DataList', 'Callout', 'Progress', 'Spinner', 'Skeleton', 'ScrollArea'],
  },
  {
    label: 'Surfaces and display',
    items: ['Card', 'Avatar', 'AspectRatio', 'Inset', 'Separator', 'Popover', 'HoverCard', 'Dialog', 'AlertDialog'],
  },
  {
    label: 'Layout and text primitives',
    items: ['Box', 'Flex', 'Grid', 'Container', 'Section', 'Heading', 'Text', 'Code', 'Link', 'Strong', 'Em', 'Kbd', 'Blockquote', 'Quote'],
  },
  {
    label: 'Utility primitives',
    items: ['AccessibleIcon', 'Portal', 'Reset', 'Slot', 'Theme', 'VisuallyHidden'],
  },
]

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
          Atom components are the smallest UI building blocks Cedar assembles into fragments and patterns.
          This page gives you the browseable atom inventory first, then the detailed pages define the exact Cedar rules
          for the atoms we standardize most heavily in the product.
        </Text>
      </Flex>

      <Flex direction="column" gap="4">
        <Heading as="h2" size="4" weight="medium">Cedar-standardized atoms</Heading>
        <Grid columns={{ initial: '1', md: '2' }} gap="5">
          <LibraryIndexCard
            href={hrefFor('buttons')}
            label={items.buttons.label}
            referenceId={items.buttons.referenceId}
            description={items.buttons.description}
            status={items.buttons.status}
            preview={
              <Flex wrap="wrap" gap="2">
                <Button variant="classic" color="gray" highContrast>Save</Button>
                <Button variant="soft" color="gray">Cancel</Button>
                <IconButton variant="ghost" color="gray" aria-label="More actions">
                  <i className="ri-more-2-line" aria-hidden="true" />
                </IconButton>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('badges')}
            label={items.badges.label}
            referenceId={items.badges.referenceId}
            description={items.badges.description}
            status={items.badges.status}
            preview={
              <Flex wrap="wrap" gap="2">
                <Badge variant="soft" color="green">Approved</Badge>
                <Badge variant="soft" color="amber">Pending</Badge>
                <Badge variant="outline" color="gray">Monitor</Badge>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('cards')}
            label={items.cards.label}
            referenceId={items.cards.referenceId}
            description={items.cards.description}
            status={items.cards.status}
            preview={
              <Flex gap="3" wrap="wrap">
                <Card variant="surface"><Box p="3"><Text as="span" size="2">Surface</Text></Box></Card>
                <Card variant="classic"><Box p="3"><Text as="span" size="2">Classic</Text></Box></Card>
                <Card variant="ghost"><Box p="3"><Text as="span" size="2">Ghost</Text></Box></Card>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('callouts')}
            label={items.callouts.label}
            referenceId={items.callouts.referenceId}
            description={items.callouts.description}
            status={items.callouts.status}
            preview={
              <Callout.Root color="blue">
                <Callout.Icon><i className="ri-information-line" aria-hidden="true" /></Callout.Icon>
                <Callout.Text>Florida-only coverage in MVP.</Callout.Text>
              </Callout.Root>
            }
          />

          <LibraryIndexCard
            href={hrefFor('tables')}
            label={items.tables.label}
            referenceId={items.tables.referenceId}
            description={items.tables.description}
            status={items.tables.status}
            preview={
              <Card variant="surface">
                <CedarTable surface="nested" size="1">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell><Text as="span" size="2">Telehealth update</Text></Table.Cell>
                      <Table.Cell><Badge variant="soft" color="amber">High</Badge></Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </CedarTable>
              </Card>
            }
          />

          <LibraryIndexCard
            href={hrefFor('form-controls')}
            label={items['form-controls'].label}
            referenceId={items['form-controls'].referenceId}
            description={items['form-controls'].description}
            status={items['form-controls'].status}
            preview={
              <Flex direction="column" gap="3">
                <TextField.Root placeholder="Search regulations…" />
                <Flex gap="3" align="center">
                  <Select.Root defaultValue="high">
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="high">High and above</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Switch color="gray" defaultChecked />
                </Flex>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('select')}
            label={items.select.label}
            referenceId={items.select.referenceId}
            description={items.select.description}
            status={items.select.status}
            preview={
              <Select.Root defaultValue="high">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="high">High and above</Select.Item>
                </Select.Content>
              </Select.Root>
            }
          />

          <LibraryIndexCard
            href={hrefFor('separator')}
            label={items.separator.label}
            referenceId={items.separator.referenceId}
            description={items.separator.description}
            status={items.separator.status}
            preview={
              <Flex direction="column" gap="3">
                <Text as="span" size="2">Section A</Text>
                <Separator size="4" />
                <Flex align="center" gap="3">
                  <Text as="span" size="2">Left</Text>
                  <Separator orientation="vertical" size="4" />
                  <Text as="span" size="2">Right</Text>
                </Flex>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('slider')}
            label={items.slider.label}
            referenceId={items.slider.referenceId}
            description={items.slider.description}
            status={items.slider.status}
            preview={
              <Flex direction="column" gap="3">
                <Slider defaultValue={[68]} />
                <Text as="span" size="2" color="gray">Confidence threshold</Text>
              </Flex>
            }
          />

          <LibraryIndexCard
            href={hrefFor('tabs-and-tooltips')}
            label={items['tabs-and-tooltips'].label}
            referenceId={items['tabs-and-tooltips'].referenceId}
            description={items['tabs-and-tooltips'].description}
            status={items['tabs-and-tooltips'].status}
            preview={
              <Flex direction="column" gap="3">
                <Tabs.Root defaultValue="summary">
                  <Tabs.List>
                    <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
                    <Tabs.Trigger value="source">Source</Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root>
                <Tooltip content="Copy hash">
                  <IconButton variant="ghost" color="gray" aria-label="Copy hash">
                    <i className="ri-file-copy-line" aria-hidden="true" />
                  </IconButton>
                </Tooltip>
              </Flex>
            }
          />
        </Grid>
      </Flex>

      <Flex direction="column" gap="4">
        <Heading as="h2" size="4" weight="medium">Radix Themes inventory available to Cedar</Heading>
        <Text as="p" size="2" color="gray" className="max-w-4xl leading-relaxed">
          Cedar can draw from a larger Radix Themes atom set than the currently documented Cedar-detail pages above.
          This inventory makes the full available surface area visible so you can compose new fragments and patterns intentionally.
        </Text>

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          <Card variant="surface">
            <Box p="4">
              <Flex direction="column" gap="3">
                <Heading as="h3" size="3" weight="medium">Live atom sampler</Heading>
                <Flex wrap="wrap" gap="2">
                  <Button variant="classic" color="gray" highContrast>Button</Button>
                  <Checkbox defaultChecked />
                  <SegmentedControl.Root defaultValue="all">
                    <SegmentedControl.Item value="all">All</SegmentedControl.Item>
                    <SegmentedControl.Item value="high">High</SegmentedControl.Item>
                  </SegmentedControl.Root>
                </Flex>
                <Flex wrap="wrap" gap="3" align="center">
                  <Slider defaultValue={[60]} className="w-32" />
                  <Progress value={72} className="w-32" />
                  <Spinner />
                  <Skeleton className="h-4 w-20 rounded" />
                </Flex>
                <ScrollArea type="always" scrollbars="vertical" className="h-20 rounded-md border border-[var(--cedar-border-subtle)]">
                  <Box p="3">
                    <Text as="p" size="2">ScrollArea, DataList, and other display atoms support dense operational layouts.</Text>
                  </Box>
                </ScrollArea>
              </Flex>
            </Box>
          </Card>

          <Card variant="surface">
            <Box p="4">
              <Flex direction="column" gap="3">
                <Heading as="h3" size="3" weight="medium">Selection card sampler</Heading>
                <CheckboxCards.Root defaultValue={['next']}>
                  <CheckboxCards.Item value="next">Next.js</CheckboxCards.Item>
                  <CheckboxCards.Item value="remix">Remix</CheckboxCards.Item>
                </CheckboxCards.Root>
                <RadioCards.Root defaultValue="monitor">
                  <RadioCards.Item value="monitor">Monitor</RadioCards.Item>
                  <RadioCards.Item value="intelligence">Intelligence</RadioCards.Item>
                </RadioCards.Root>
                <TextArea placeholder="TextArea" />
              </Flex>
            </Box>
          </Card>
        </Grid>

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          {RADIX_ATOM_CATEGORIES.map((category) => (
            <Card key={category.label} variant="surface">
              <Box p="4">
                <Flex direction="column" gap="3">
                  <Heading as="h3" size="3" weight="medium">{category.label}</Heading>
                  <Flex wrap="wrap" gap="2">
                    {category.items.map((item) => (
                      <Badge key={item} variant="outline" color="gray">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Box>
            </Card>
          ))}
        </Grid>

        <Card variant="surface">
          <Box p="4">
            <Flex direction="column" gap="3">
              <Heading as="h3" size="3" weight="medium">Quick composition kit</Heading>
              <Text as="p" size="2" color="gray">
                The practical Cedar workflow is: choose the right atom here, confirm the exact Cedar rule on the detailed atom page,
                then assemble those atoms into a fragment or page pattern. This is the layer you should be able to screenshot, annotate,
                and hand back as a component brief.
              </Text>
              <DataList.Root>
                <DataList.Item>
                  <DataList.Label>Example</DataList.Label>
                  <DataList.Value>BTN-01 classic gray button + metric card + info tooltip + PAT-002 collection header</DataList.Value>
                </DataList.Item>
              </DataList.Root>
            </Flex>
          </Box>
        </Card>
      </Flex>
    </Flex>
  )
}
