import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { DbClientRow } from "@/databaseUtils";

export type ClientsFilterMethod = ServerSideFilterMethod<DbClientRow, string>;
export type ClientsFilter = ServerSideFilter<ClientsTableRow, string, DbClientRow>;
export type ClientsSortMethod = ServerSideSortMethod<DbClientRow>;
export type ClientsSortState = SortState<ClientsTableRow, ClientsSortMethod>;

export type GetClientsDataAndCountErrorType =
    | "abortedFetchingClientsTable"
    | "abortedFetchingClientsTableCount"
    | "failedToFetchClientsTable"
    | "failedToFetchClientsTableCount";

export type GetClientsReturnType =
    | {
          error: null;
          data: {
              clientData: ClientsTableRow[];
              count: number;
          };
      }
    | {
          error: { type: GetClientsDataAndCountErrorType; logId: string };
          data: null;
      };

export type GetClientsCountReturnType =
    | {
          error: { type: GetClientsDataAndCountErrorType; logId: string };
          data: null;
      }
    | {
          error: null;
          data: number;
      };

export interface ClientsTableRow {
    clientId: string;
    fullName: string;
    familyCategory: string;
    addressPostcode: string | null;
}