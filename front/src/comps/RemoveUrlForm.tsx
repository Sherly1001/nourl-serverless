import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { removeUrl } from "../api";

export default function RemoveUrlForm() {
  const toast = useToast();

  const [rmCode, setRmCode] = useState("");
  const rmCodeRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  const onRemove = useCallback(
    (e: SyntheticEvent<Element, Event>) => {
      e.preventDefault();

      removeUrl(rmCode)
        .then((res) => {
          toast({
            position: "top-right",
            title: "Remove successfully",
            description: res.data
              ? `Shorted code "${res.data.code}" to url "${res.data.url}" has been removed`
              : "not existed",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          setRmCode("");
          setTimeout(() => {
            rmCodeRef.current?.focus();
          }, 100);
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
    [rmCode, rmCodeRef],
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
      <form onSubmit={onRemove}>
        <Text fontSize="4xl" align="center">
          Remove shorted url
        </Text>
        <FormControl>
          <FormLabel>
            <Text>Code</Text>
          </FormLabel>
          <Input
            type="code"
            required
            ref={rmCodeRef}
            value={rmCode}
            onChange={(e) => setRmCode(e.target.value)}
          />
        </FormControl>
        <Box mt="1rem">
          <Flex direction="row-reverse">
            <Button minW="10rem" type="submit">
              Remove
            </Button>
          </Flex>
        </Box>
      </form>
    </Box>
  );
}
