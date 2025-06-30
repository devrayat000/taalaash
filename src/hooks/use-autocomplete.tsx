import { useConnector } from "react-instantsearch";
import connectAutocomplete from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";

import type {
  AutocompleteConnectorParams,
  AutocompleteWidgetDescription,
} from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";

export type UseAutocompleteProps = AutocompleteConnectorParams;

// Connect the InstantSearch.js `connectAutocomplete` connector to your component
export function useAutocomplete(props?: UseAutocompleteProps) {
  return useConnector<
    AutocompleteConnectorParams,
    AutocompleteWidgetDescription
  >(connectAutocomplete, props);
}
