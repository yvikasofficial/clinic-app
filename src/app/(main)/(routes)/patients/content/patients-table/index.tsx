import { Patient } from "@/types/patient";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import {
  ContactDetailsCellRenderer,
  DateOfBirthCellRenderer,
  NameCellRenderer,
  StatusCellRenderer,
} from "./columns";
import { useRouter } from "next/navigation";

const PatientsTable = ({
  patients,
  isLoading,
}: {
  patients: Patient[];
  isLoading: boolean;
}) => {
  const router = useRouter();
  // Column definitions for AG Grid
  const columnDefs: ColDef<Patient>[] = useMemo(
    () => [
      {
        headerName: "Name",
        field: "firstName",
        cellRenderer: NameCellRenderer,
        minWidth: 250,
        sort: "asc",
        flex: 1,
      },
      {
        headerName: "Contact Details",
        field: "email",
        cellRenderer: ContactDetailsCellRenderer,
        minWidth: 300,
        sortable: false,
        flex: 1,
      },
      {
        headerName: "Date of Birth",
        field: "dateOfBirth",
        cellRenderer: DateOfBirthCellRenderer,
        width: 200,
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: StatusCellRenderer,
        width: 180,
      },
      {
        headerName: "Created Date",
        field: "createdDate",
        width: 150,
        cellRenderer: ({ value }: { value: string }) =>
          new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  // Default column properties
  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  return (
    <AgGridReact
      loading={isLoading}
      rowData={patients}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      pagination={true}
      paginationPageSize={20}
      rowSelection="single"
      animateRows={true}
      enableCellTextSelection={true}
      suppressCellFocus={true}
      rowHeight={60}
      onRowClicked={(event) => {
        const row = event.data;
        if (row) {
          router.push(`/patients/${row.id}`);
        }
      }}
    />
  );
};

export default PatientsTable;
