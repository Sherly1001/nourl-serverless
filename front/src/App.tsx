import {
  Box,
  Button,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

import AddUrlForm from "./comps/AddUrlForm";
import ListUrls from "./comps/ListUrls";
import RemoveUrlForm from "./comps/RemoveUrlForm";

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  const [currentTab, setCurrentTab] = useState(0);

  const keyboardTracking = useRef("");
  const [showAdvanceActions, setShowAdvanceActions] = useState(false);

  const CODE = "";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target != document.body) return;

      keyboardTracking.current += e.key;
      if (keyboardTracking.current.length > CODE.length) {
        keyboardTracking.current = keyboardTracking.current.slice(-CODE.length);
      }

      if (keyboardTracking.current == CODE) {
        setShowAdvanceActions(true);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <Container maxW="container.lg">
      <Box pos="fixed" top="1rem" right="2rem">
        <Button onClick={toggleColorMode} p="1rem">
          <FontAwesomeIcon
            size="xl"
            icon={colorMode == "light" ? faSun : faMoon}
          />
        </Button>
      </Box>
      <Box mt="3rem">
        <Text fontSize="6xl" textAlign="center">
          Welcome to NoUrl
        </Text>
        <Box>
          <Tabs onChange={(idx) => setCurrentTab(idx)}>
            <TabList>
              <Tab>Create</Tab>
              <Tab>Remove</Tab>
              {showAdvanceActions && <Tab>List Shorted Urls</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel>
                <Container maxW="container.sm">
                  <AddUrlForm />
                </Container>
              </TabPanel>
              <TabPanel>
                <Container maxW="container.sm">
                  <RemoveUrlForm />
                </Container>
              </TabPanel>
              {showAdvanceActions && (
                <TabPanel>
                  <ListUrls isTabShow={currentTab == 2} />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Container>
  );
}
