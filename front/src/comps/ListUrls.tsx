import {
  Avatar,
  Flex,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { getUrls } from "../api";
import SortIcons, { nextSort } from "./SortIcons";

interface Url {
  _id: string;
  code: string;
  url: string;
  owner?: {
    _id: string;
    display_name: string;
    avatar_url: string;
  };
}

export default function ListUrls({ isTabShow }: { isTabShow: boolean }) {
  const tableRef = useRef<HTMLDivElement | null>(null);

  const [urls, setUrls] = useState<Url[]>([]);

  const limit = 50;
  const [skip, setSkip] = useState(0);
  const preSkip = useRef<typeof skip>();

  const [sort, setSort] = useState<Record<string, number>>({});
  const preSort = useRef<typeof sort>();

  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    function reset() {
      setUrls([]);
      isEnded && setIsEnded(false);
      skip > 0 && setSkip(0);
    }

    if (!isTabShow || (sort != preSort.current && skip > 0)) {
      reset();
    } else if (!isEnded) {
      const filter = Object.assign(
        { skip, limit },
        {
          sort:
            Object.keys(sort)
              .filter((key) => sort[key])
              .map((key) => `${key},${sort[key]}`)
              .join(",") || null,
        },
      );

      setIsLoading(true);
      getUrls(filter)
        .then((rs) => {
          if (rs.data.length < limit) {
            setIsEnded(true);
          }
          setUrls((urls) => (skip != 0 ? [...urls, ...rs.data] : rs.data));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    preSkip.current != skip && (preSkip.current = skip);
    preSort.current != sort && (preSort.current = sort);
  }, [isTabShow, isEnded, sort, preSort, skip]);

  const lastScrollTop = useRef(0);
  useEffect(() => {
    if (!tableRef.current) return;

    const scrollHandler = (e: Event) => {
      const el = e.target as HTMLDivElement;

      if (
        !isLoading &&
        el.scrollTop > lastScrollTop.current &&
        el.scrollHeight - el.clientHeight - el.scrollTop < 100
      ) {
        setSkip((skip) => skip + limit);
        tableRef.current?.removeEventListener("scroll", scrollHandler);
      }

      lastScrollTop.current = el.scrollTop;
    };

    tableRef.current.addEventListener("scroll", scrollHandler);

    return () => {
      tableRef.current?.removeEventListener("scroll", scrollHandler);
    };
  }, [tableRef, isLoading]);

  const [tooltipClicked, setTooltipClicked] = useState(false);
  useEffect(() => {
    if (tooltipClicked) {
      setTimeout(() => {
        setTooltipClicked(false);
      }, 1000);
    }
  }, [tooltipClicked]);

  return (
    <TableContainer h="70vh" overflowY="auto" userSelect="none" ref={tableRef}>
      <Table size="sm">
        <Thead position="sticky" top={0} zIndex="docked" bg="Background">
          <Tr h="2rem">
            <Th w="1rem">no.</Th>
            <Th
              w="8rem"
              cursor="pointer"
              onClick={() => {
                setSort((sort) => ({
                  code: nextSort(sort.code ?? 0),
                  ...Object.fromEntries(
                    Object.entries(sort).filter(([key, _]) => key != "code"),
                  ),
                }));
              }}
            >
              <Flex alignItems="center" justifyContent="space-between">
                <Text>code</Text>
                <SortIcons sort={sort.code} />
              </Flex>
            </Th>
            <Th w="40rem">url</Th>
            <Th
              cursor="pointer"
              onClick={() => {
                setSort((sort) => ({
                  ["owner.display_name"]: nextSort(
                    sort["owner.display_name"] ?? 0,
                  ),
                  ...Object.fromEntries(
                    Object.entries(sort).filter(
                      ([key, _]) => key != "owner.display_name",
                    ),
                  ),
                }));
              }}
            >
              <Flex alignItems="center" justifyContent="space-between">
                <Text>owner</Text>
                <SortIcons sort={sort["owner.display_name"]} />
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {urls.map((url, idx) => (
            <Tr key={idx} h="4rem">
              <Td w="1rem">{idx + 1}</Td>
              <Td
                maxW="8rem"
                cursor="pointer"
                onClick={() => {
                  navigator.clipboard.writeText(url.code);
                  setTooltipClicked(true);
                }}
              >
                <Tooltip
                  hasArrow
                  placement="top"
                  closeOnClick={false}
                  label={tooltipClicked ? "Copied to clipboard" : url.code}
                  background={
                    tooltipClicked ? "green.400" : "var(--tooltip-bg)"
                  }
                >
                  <Text
                    as="span"
                    maxW="8rem"
                    display="inline-block"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {url.code}
                  </Text>
                </Tooltip>
              </Td>
              <Td maxW="40rem" overflow="hidden" textOverflow="ellipsis">
                <Link href={url.url} target="_blank">
                  {url.url}
                </Link>
              </Td>
              <Td>
                {url.owner ? (
                  <Tooltip placement="top" label={url.owner.display_name}>
                    <Avatar
                      name={url.owner.display_name}
                      src={url.owner.avatar_url}
                    />
                  </Tooltip>
                ) : (
                  ""
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {isLoading && (
        <Flex
          top={0}
          left={0}
          w="100%"
          h="100%"
          position="absolute"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Spinner
            size="xl"
            thickness="0.3rem"
            emptyColor="gray.200"
            color="blue.500"
          />
        </Flex>
      )}
    </TableContainer>
  );
}
