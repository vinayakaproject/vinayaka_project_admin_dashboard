// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import { useHistory } from "react-router-dom";
import IconBox from "components/Icons/IconBox";
import Loading from "components/Loading/Loading";
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React, { useEffect, useState } from "react";
// Variables
import {
  barChartData,
  barChartOptions,
  lineChartData,
  lineChartOptions,
} from "variables/charts";
import { pageVisits, socialTraffic } from "variables/general";
import { userFun } from "utils/utilites";

export default function Dashboard() {
  // Chakra Color Mode
  const history = useHistory();

  const totalOrdersLoc = localStorage.getItem('totalOrders');
  const totalProdLoc = localStorage.getItem('totalProd');
  const latestOrdersLoc = localStorage.getItem('latestOrders') ? JSON.parse(localStorage.getItem('latestOrders')) : [];

  const toast = useToast();
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");

  const { colorMode } = useColorMode();

  const [totalProd, settotalProd] = useState(totalOrdersLoc);
  const [totalOrders, settotalOrders] = useState(totalProdLoc);
  const [latestOrders, setlatestOrders] = useState(latestOrdersLoc);
  const [loading, setLoading] = useState(false);

  const getDetails = async () => {
    setLoading(true);
    const totalProdRes = await userFun('getTotalProducts', null, 'GET');
    const totalOrderRes = await userFun('getTotalOrders', null, 'GET');
    const latestOrders = await userFun('getLatestFiveOrders', null, 'GET');

    if (totalProdRes.status === 201 && totalOrderRes.status === 201 && latestOrders.status === 201) {
      localStorage.setItem('totalOrders', totalOrderRes.message);
      localStorage.setItem('totalProd', totalProdRes.message);
      localStorage.setItem('latestOrders', JSON.stringify(latestOrders.message));
      console.log(latestOrders.message);
      settotalProd(totalProdRes.message);
      settotalOrders(totalOrderRes.message);
      setlatestOrders(latestOrders.message);
    }else {
      toast({
          title: 'Error',
          description: "There was an error. Please try again after sometime",
          status: 'error',
          duration: 9000,
          isClosable: true,
      })
    }
    setLoading(false);
  }

  useEffect(() => {
    latestOrders.length === 0 && getDetails();
    window.onbeforeunload = function () {
      console.log("In onbeforeunload");
      localStorage.removeItem('totalOrders');
      localStorage.removeItem('totalProd');
      localStorage.removeItem('latestOrders');
    };
  }, [])

  if(loading === true && latestOrders.length === 0) return <Loading mt={10} pt={20} color={'#fff'} />;
  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px' mb='20px'>
        <Card minH='125px'>
          <Flex direction='column'>
            <Flex
              flexDirection='row'
              align='center'
              justify='center'
              w='100%'>
              <Stat me='auto'>
                <StatLabel
                  fontSize='md'
                  color='gray.400'
                  fontWeight='bold'
                  textTransform='uppercase'>
                  Total Orders
                </StatLabel>
                <Flex mt={5}>
                  <StatNumber fontSize='5xl' color={textColor} fontWeight='bold'>
                    {totalOrders}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius='50%'
                as='box'
                h={"45px"}
                w={"45px"}
                bg={iconBlue}>
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color='gray.400' fontSize='sm'>
              <Text as='span' color='green.400' fontWeight='bold'>
                +3.48%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
        <Card minH='125px'>
          <Flex direction='column'>
            <Flex
              flexDirection='row'
              align='center'
              justify='center'
              w='100%'>
              <Stat me='auto'>
                <StatLabel
                  fontSize='md'
                  color='gray.400'
                  fontWeight='bold'
                  textTransform='uppercase'>
                  Total Products
                </StatLabel>
                <Flex mt={5}>
                  <StatNumber fontSize='5xl' color={textColor} fontWeight='bold'>
                    {totalProd}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius='50%'
                as='box'
                h={"45px"}
                w={"45px"}
                bg={iconBlue}>
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color='gray.400' fontSize='sm'>
              <Text as='span' color='green.400' fontWeight='bold'>
                +5.2%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
      </SimpleGrid>
      <Flex>
        <Card p='0px' maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction='column'>
            <Flex align='center' justify='space-between' p='22px'>
              <Text fontSize='lg' color={textColor} fontWeight='bold'>
                Latest Orders
              </Text>
              <Button variant='primary' maxH='30px' onClick={() => history.push("/admin/orders")}>
                SEE ALL
              </Button>
            </Flex>
          </Flex>
          <Box overflow={{ sm: "scroll", lg: "hidden" }}>
            <Table overflow={'auto'} variant="simple" color={textColor}>
              <Thead>
                <Tr my=".8rem" pl="0px" color="gray.400" >
                  <Th borderColor={borderColor} color="gray.400" >Date</Th>
                  <Th borderColor={borderColor} color="gray.400" >Payment Mode</Th>
                  <Th borderColor={borderColor} color="gray.400" >Total Cost</Th>
                  <Th borderColor={borderColor} color="gray.400" >Amount Paid</Th>
                  <Th borderColor={borderColor} color="gray.400" >Online OrderID</Th>
                  <Th borderColor={borderColor} color="gray.400" ></Th>
                </Tr>
              </Thead>
              <Tbody>
                {latestOrders.map((row) => {
                  return (
                      <Tr key={row._id} overflow={'auto'}>
                          <Td>
                              {new Date(row.date).toDateString()}
                          </Td>
                          <Td>
                              {row.paymentMode}
                          </Td>
                          <Td>
                            ₹{row.totalCost}
                          </Td>
                          <Td>
                            ₹{row.amountPaid}
                          </Td>
                          <Td width={10}>
                              {row.orderId}
                          </Td>
                          <Td>
                              <Button colorScheme="blue" onClick={() => history.push("/admin/orders")}>View</Button>
                          </Td>
                      </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </Flex>
    </Flex>
  );
}
