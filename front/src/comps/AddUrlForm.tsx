import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { addUrl } from "../api";

export default function AddUrlForm() {
  const toast = useToast();

  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [created, setCreated] = useState(false);

  const shortUrl = useMemo(() => `${window.location.origin}/${code}`, [code]);

  const codeRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  const onSubmit = useCallback(
    (e: SyntheticEvent<Element, Event>) => {
      e.preventDefault();

      if (created) {
        setCode("");
        setUrl("");
        setCreated(false);
        return setTimeout(() => {
          codeRef.current?.focus();
        }, 100);
      }

      addUrl(code, url)
        .then((_res) => {
          toast({
            position: "top-right",
            title: "Create successfully",
            status: "success",
            duration: 2000,
            isClosable: true,
          });

          setCreated(true);
        })
        .catch((err) => {
          toast({
            position: "top-right",
            title: err.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    },
    [code, url, created, codeRef],
  );

  return (
    <Box
      mt="2rem"
      p="1rem"
      border="solid"
      borderWidth="0.1rem"
      borderColor="var(--chakra-colors-chakra-border-color)"
      borderRadius="0.5rem"
    >
      <form onSubmit={onSubmit}>
        <Text fontSize="4xl" align="center">
          Create new shorted url
        </Text>
        <FormControl>
          <FormLabel>
            <Text>Code</Text>
          </FormLabel>
          <Input
            type="code"
            required
            ref={codeRef}
            disabled={created}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {created && (
            <FormLabel>
              <Link href={shortUrl} target="_blank">
                {shortUrl}
              </Link>
            </FormLabel>
          )}
        </FormControl>
        <FormControl mt="1rem">
          <FormLabel>
            <Text>Url</Text>
          </FormLabel>
          <Input
            type="url"
            required
            disabled={created}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </FormControl>
        <Box mt="1rem">
          <Flex direction="row-reverse">
            <Button minW="10rem" type="submit">
              {created ? "Create another shorted url" : "Create"}
            </Button>
          </Flex>
        </Box>
      </form>
    </Box>
  );
}
