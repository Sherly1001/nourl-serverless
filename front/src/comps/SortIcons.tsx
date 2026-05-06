import { Flex } from "@chakra-ui/react";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function nextSort(sort: number) {
  return sort == 0 ? 1 : sort == 1 ? -1 : 0;
}

export default function SortIcons({
  sort = 0,
}: {
  sort?: number;
  onChange?: (sort: number) => void;
}) {
  return (
    <Flex direction="column">
      <FontAwesomeIcon icon={faCaretUp} opacity={sort == 1 ? 1 : 0.2} />
      <FontAwesomeIcon icon={faCaretDown} opacity={sort == -1 ? 1 : 0.2} />
    </Flex>
  );
}
