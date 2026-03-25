import { Card, Table, Text } from '@radix-ui/themes'
import { CedarTable } from '@/components/CedarTable'

export interface VariantRegistryRow {
  code: string
  name: string
  purpose: string
  contract: string
}

export function VariantRegistry({ rows }: { rows: VariantRegistryRow[] }) {
  return (
    <Card variant="surface">
      <CedarTable surface="nested" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Reference</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Purpose</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Contract</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.code}>
              <Table.Cell>
                <Text as="span" size="2" className="font-mono">
                  {row.code}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text as="span" size="2">
                  {row.name}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text as="span" size="2" color="gray">
                  {row.purpose}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text as="span" size="2" className="font-mono text-[var(--cedar-text-secondary)]">
                  {row.contract}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </CedarTable>
    </Card>
  )
}
