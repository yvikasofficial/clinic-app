import { Charge, ChargeStatus } from "@/types/charge";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import clsx from "clsx";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import PaymentMethodsManager from "./payment-methods-manager";
import { PaymentMethod } from "@/types/paymentMethods";

ModuleRegistry.registerModules([AllCommunityModule]);

// Status cell renderer for charge status
const ChargeStatusCellRenderer = ({ value }: { value: ChargeStatus }) => {
  const statusStyles = {
    [ChargeStatus.PAID]: "bg-blue-100 text-blue-700",
    [ChargeStatus.UNPAID]: "bg-red-100 text-red-700",
    [ChargeStatus.PARTIALLY_PAID]: "bg-yellow-100 text-yellow-700",
    [ChargeStatus.CANCELLED]: "bg-gray-100 text-gray-700",
    [ChargeStatus.REFUNDED]: "bg-purple-100 text-purple-700",
  };

  const statusColors = {
    [ChargeStatus.PAID]: "bg-blue-500",
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
        <div className="text-xs text-red-400 font-medium">
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
      <div className="text-sm font-medium text-blue-600">
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
  paymentMethods,
  isPaymentMethodsLoading,
}: {
  charges: Charge[];
  isLoading: boolean;
  paymentMethods: PaymentMethod[];
  isPaymentMethodsLoading: boolean;
}) => {
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCharges = charges.length;
    const totalAmount = charges.reduce((sum, charge) => sum + charge.total, 0);
    const totalOutstanding = charges.reduce(
      (sum, charge) => sum + charge.totalOutstanding,
      0
    );
    const totalPaid = totalAmount - totalOutstanding;

    const statusCounts = charges.reduce((acc, charge) => {
      acc[charge.status] = (acc[charge.status] || 0) + 1;
      return acc;
    }, {} as Record<ChargeStatus, number>);

    return {
      totalCharges,
      totalAmount,
      totalOutstanding,
      totalPaid,
      statusCounts,
    };
  }, [charges]);

  const handleCreatePayment = () => {
    // TODO: Implement create payment functionality
    console.log("Create new payment clicked");
  };

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
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold"> Charges</h2>
              <p className="text-muted-foreground text-sm">
                Manage and track all charges and payments for this patient
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreatePayment}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Payment
            </Button>
            <PaymentMethodsManager
              paymentMethods={paymentMethods as PaymentMethod[]}
              isLoading={isPaymentMethodsLoading}
              onPaymentMethodsChange={() => {}}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Charges
              </h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{summaryStats.totalCharges}</p>
              <p className="text-xs text-muted-foreground">
                ${summaryStats.totalAmount.toFixed(2)} total value
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-400 rounded-full" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Paid
              </h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-blue-400">
                ${summaryStats.totalPaid.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summaryStats.statusCounts[ChargeStatus.PAID] || 0} paid charges
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-400 rounded-full" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Outstanding
              </h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-red-400">
                ${summaryStats.totalOutstanding.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summaryStats.statusCounts[ChargeStatus.UNPAID] || 0} unpaid
                charges
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-yellow-400 rounded-full" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Partial Payments
              </h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-yellow-400">
                {summaryStats.statusCounts[ChargeStatus.PARTIALLY_PAID] || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Partially paid charges
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid */}
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
    </div>
  );
};

export default Charges;
