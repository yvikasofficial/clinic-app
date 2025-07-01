import { Charge, ChargeStatus } from "@/types/charge";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// Status cell renderer for charge status
const ChargeStatusCellRenderer = ({ value }: { value: ChargeStatus }) => {
  const statusStyles = {
    [ChargeStatus.PAID]: "bg-green-100 text-green-700",
    [ChargeStatus.UNPAID]: "bg-red-100 text-red-700",
    [ChargeStatus.PARTIALLY_PAID]: "bg-yellow-100 text-yellow-700",
    [ChargeStatus.CANCELLED]: "bg-gray-100 text-gray-700",
    [ChargeStatus.REFUNDED]: "bg-purple-100 text-purple-700",
  };

  const statusColors = {
    [ChargeStatus.PAID]: "bg-green-500",
    [ChargeStatus.UNPAID]: "bg-red-500",
    [ChargeStatus.PARTIALLY_PAID]: "bg-yellow-500",
    [ChargeStatus.CANCELLED]: "bg-gray-500",
    [ChargeStatus.REFUNDED]: "bg-purple-500",
  };

  return (
    <Badge
      variant="secondary"
      className={clsx(
        statusStyles[value],
        "rounded-sm py-1.5 px-2.5 text-xs font-medium"
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={clsx("w-1.5 h-1.5 rounded-full", statusColors[value])}
        />
        {value.replace(/_/g, " ")}
      </div>
    </Badge>
  );
};

// Amount cell renderer with outstanding amount
const AmountCellRenderer = ({ data }: { data: Charge }) => {
  return (
    <div className="py-1 flex flex-col gap-0.5">
      <div className="font-semibold text-sm">${data.total.toFixed(2)}</div>
      {data.totalOutstanding > 0 && (
        <div className="text-xs text-red-600 font-medium">
          Outstanding: ${data.totalOutstanding.toFixed(2)}
        </div>
      )}
    </div>
  );
};

// Creator cell renderer
const CreatorCellRenderer = ({ data }: { data: Charge }) => {
  return (
    <div className="py-1">
      <div className="text-sm font-medium">
        {`${data.creator.firstName} ${data.creator.lastName}`}
      </div>
      <div className="text-xs text-gray-500">{data.creator.email}</div>
    </div>
  );
};

// Items cell renderer
const ItemsCellRenderer = ({ data }: { data: Charge }) => {
  const totalItems = data.items.length;
  const totalQuantity = data.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="py-1">
      <div className="text-sm font-medium">
        {totalItems} item{totalItems !== 1 ? "s" : ""}
      </div>
      <div className="text-xs text-gray-500">Qty: {totalQuantity}</div>
    </div>
  );
};

// Payments cell renderer
const PaymentsCellRenderer = ({ data }: { data: Charge }) => {
  const totalPayments = data.payments.length;
  const totalPaid = data.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  if (totalPayments === 0) {
    return <div className="text-xs text-gray-500">No payments</div>;
  }

  return (
    <div className="py-1">
      <div className="text-sm font-medium text-green-600">
        ${totalPaid.toFixed(2)}
      </div>
      <div className="text-xs text-gray-500">
        {totalPayments} payment{totalPayments !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

const Charges = ({
  charges,
  isLoading,
}: {
  charges: Charge[];
  isLoading: boolean;
}) => {
  // Column definitions for AG Grid
  const columnDefs: ColDef<Charge>[] = useMemo(
    () => [
      {
        headerName: "Description",
        field: "description",
        minWidth: 200,
        flex: 1,
        cellRenderer: ({ value }: { value: string }) => (
          <div className="text-sm py-2 truncate" title={value}>
            {value || <span className="text-gray-500">No description</span>}
          </div>
        ),
      },

      {
        headerName: "ID",
        field: "id",
        width: 120,
        pinned: "left",
        cellRenderer: ({ value }: { value: string }) => (
          <div className="font-mono text-xs text-gray-600 py-2">
            {value.slice(-8)}
          </div>
        ),
      },
      {
        headerName: "Amount",
        field: "total",
        cellRenderer: AmountCellRenderer,
        width: 190,
        comparator: (valueA, valueB) => valueA - valueB,
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: ChargeStatusCellRenderer,
        width: 180,
      },
      {
        headerName: "Items",
        field: "items",
        cellRenderer: ItemsCellRenderer,
        width: 120,
        sortable: false,
      },
      {
        headerName: "Payments",
        field: "payments",
        cellRenderer: PaymentsCellRenderer,
        width: 150,
        sortable: false,
      },

      {
        headerName: "Created By",
        field: "creator.firstName",
        cellRenderer: CreatorCellRenderer,
        width: 220,
      },

      {
        headerName: "Created Date",
        field: "createdDate",
        width: 130,
        cellRenderer: ({ value }: { value: string }) => (
          <div className="text-sm py-2">
            {new Date(value).toLocaleDateString()}
          </div>
        ),
      },
    ],
    []
  );

  // Default column properties
  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: false,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  return (
    <div className="h-[400px] w-full">
      <AgGridReact
        loading={isLoading}
        rowData={charges}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
        rowSelection="single"
        animateRows={true}
        enableCellTextSelection={true}
        suppressCellFocus={true}
        rowHeight={60}
        headerHeight={45}
        suppressRowClickSelection={false}
        className="ag-theme-alpine"
      />
    </div>
  );
};

export default Charges;
