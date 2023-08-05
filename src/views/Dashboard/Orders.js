// Chakra imports
import {
  Badge,
  Button,
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  Select,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
  Image,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { tablesProjectData } from "variables/general";
import Loading from "components/Loading/Loading";
import { userFun } from "utils/utilites";

var alertContent;

function SelectStatus(props, type) { 
  return <Select {...props}>
    {props.type === 'filter' && <option value='All'>All</option>}
    <option value='Shipping'>Shipping</option>
    <option value='Delivered'>Delivered</option>
    <option value='Cancelled'>Cancelled</option>
  </Select>
}

function Orders() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const toast = useToast()

  const allOrders = localStorage.getItem('allOrders') ? JSON.parse(localStorage.getItem('allOrders')) : null;
  const productOrderQuery = localStorage.getItem('productOrderQuery') ? JSON.parse(localStorage.getItem('productOrderQuery')) : {};

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(allOrders);
  const [updateStatBtnLoad, setupdateStatBtnLoad] = useState(false);
  const [newStat, setnewStat] = useState("");
  const [filterStat, setfilterStat] = useState("");
  const [showMoreLoading, setshowMoreLoading] = useState(false);

  useEffect(() => {
    console.log("In use effect")
    console.log(allOrders)
    const fetchOrders = async () => {
      console.log("In fetch")
      setLoading(true);
      const order = await userFun('getAllOrders', {
        query: productOrderQuery
      }, 'POST');
      
      if(order.status === 201) {
        console.log(order);    
        localStorage.setItem('allOrders', JSON.stringify(order.message))
        setOrders(order.message)
      }else {
          toast({
              title: 'Error',
              description: order.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
          })
      }
      setLoading(false);
    }
    console.log(allOrders)
    !allOrders && fetchOrders()
  }, [])

  useEffect(() => { 
    window.onbeforeunload = function () {
      console.log("In onbeforeunload");
      localStorage.removeItem('allOrders')
    };
  }, []);

  useEffect(() => { 
    onClose()
  }, [])

  const viewUsers = (users) => {
    alertContent = {
      type: 'view',
      title: 'Users',
      size: '5xl',
      body: {
        headers: ['Name', 'Email', 'Address', 'Phone'],
        data: [users]
      },
    }
    onOpen()
  }

  const viewProducts = (products, quantity) => {
    const modifiedProd = products.map((prod, index) => {
        const prodQuantity = quantity[index]
        const prodTotPrice = prod.price * prodQuantity
        return {
            image:  <Flex width={'10vw'} height={'10vh'}>
              <Image src={prod.image} width={'full'} height={'full'} objectFit={'contain'} alt={prod.name} />
            </Flex>,
            name: prod.name,
            price: '₹'+ prod.price,
            totalQuan: prodQuantity,
            totalCost: '₹'+ prodTotPrice,
        }
    })
    console.log(modifiedProd)
    alertContent = {
        type: 'view',
        title: 'Products',
        size: '5xl',
        body: {
          headers: ['', 'Name', 'Price', 'Ordered Quantity', 'Total Product Cost'],
          data: modifiedProd
        },
    }
    onOpen()
  }

  const editStat = async () => {
    setupdateStatBtnLoad(true);
    const order = await userFun('updateOrderStat', { 
      orderId: alertContent.orderId,
      status: newStat
    }, 'POST');
    
    if(order.status === 201) {
      console.log(order);   
      const targetOrder = orders.find((order) => order._id === alertContent.orderId)
      if(targetOrder) { 
        targetOrder.status = newStat
        const updatedOrders = [...orders]
        localStorage.setItem('allOrders', JSON.stringify(updatedOrders))
        setOrders(updatedOrders)
        toast({
            title: 'Success',
            description: order.message,
            status: 'success',
            duration: 9000,
            isClosable: true,
        })
        onClose()
      }  
    }else {
        toast({
            title: 'Error',
            description: order.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }
    setupdateStatBtnLoad(false);
  }

  const filterOrders =  async (e) => { 
    setLoading(true);
    console.log(allOrders)

    const value = e.target.value;
    setfilterStat(value);

    const query =  (value === 'All' || value ===  '') ? { ...productOrderQuery, status: { $ne: 'Cancelled' } } : { 
      ...productOrderQuery,
      status: value
    }

    const order = await userFun('getOrderbyFilter', {
      query,
      skip: 0
    }, 'POST');
    
    if(order.status === 201) {
      console.log(order);   
      localStorage.setItem('allOrders', JSON.stringify(order.message))
      setOrders(order.message)
    }else {
        toast({
            title: 'Error',
            description: order.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }
    setLoading(false);
  }

  const showMore = async () => { 
    setshowMoreLoading(true);

    const query = (filterStat === 'All' || filterStat ===  '') ? { ...productOrderQuery, status: { $ne: 'Cancelled' } } : { 
      ...productOrderQuery,
      status: filterStat
    }

    const order = await userFun('getOrderbyFilter', {
      query,
      skip: orders.length
    }, 'POST');
    
    if(order.status === 201) {
      console.log(order);  
      const newOrders = [...orders, ...order.message] 
      localStorage.setItem('allOrders', JSON.stringify(newOrders))
      setOrders(newOrders)
    }else {
        toast({
            title: 'Error',
            description: order.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }
    setshowMoreLoading(false);
    
  }

  const getBadgeColour = (status) => { 

    switch(status) {
      case 'Ordered':
        return 'gray.300'
      case 'Shipping':
        return 'blue.300'
      case 'Delivered':
        return 'green.300'
      case 'Cancelled':
        return 'red.300'
      default:
        return 'gray.300'
    }
  }

  const cancelProdFilter = () => {
    localStorage.removeItem('productOrderQuery');
    window.location.reload();
  }

  if(loading === true && orders === null) return <Loading mt={10} pt={20} color={'#fff'} />;
  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
     <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={alertContent && alertContent.size}
        px={10}
        overflow={'auto'}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{alertContent && alertContent.title}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            {
              alertContent && alertContent.type === 'view' ?
              <Table overflow={'auto'}>
                  <Thead>
                      <Tr>
                          {alertContent && alertContent.body.headers.map((header, index) => (
                              <Th key={index} color="gray.400">{header}</Th>
                          ))}
                      </Tr>
                  </Thead>
                  <Tbody>
                      {alertContent && alertContent.body.data.map((row, index) => (
                          <Tr key={index}>
                              {
                              Object.keys(row).map((key, index) => (
                                  <Td key={index} color="gray.400">{row[key]}</Td>
                              ))
                              }
                          </Tr>
                      ))}
                  </Tbody>
              </Table>
              :
              <Flex flexDirection={'column'} mt={10} pb={10}>
                <SelectStatus onChange={(e) => setnewStat(e.target.value)} defaultValue={alertContent && alertContent.defaultValue} placeholder='Change status' variant="filled" />
                <Button onClick={editStat} mt={10} isLoading={updateStatBtnLoad}>
                  Update
                </Button>
              </Flex>
            }
          </AlertDialogBody>
        </AlertDialogContent>
  
      </AlertDialog>  
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <Flex flex={1} width={'100%'}>
          <CardHeader p="6px 0px 22px 0px" width={'80%'}>
            <Text fontSize="xl" color={textColor} fontWeight="bold">
              Orders
            </Text>
          </CardHeader>
          <Flex justifyContent={'flex-end'} gap={2}>
            {
              Object.keys(productOrderQuery).length > 0 && <Button width={'100%'} colorScheme='red' color='#fff' onClick={cancelProdFilter}>Cancel Product Filter</Button>
            }
            <SelectStatus onChange={filterOrders} pl={Object.keys(productOrderQuery).length > 0 ? 0 : 10} variant="filled" placeholder='Filter by status' type="filter" />
          </Flex>
        </Flex>
        <CardBody>
          <Table overflow={'auto'} variant="simple" color={textColor}>
            <Thead>
              <Tr my=".8rem" pl="0px" color="gray.400" >
                <Th borderColor={borderColor} color="gray.400" >Date</Th>
                <Th borderColor={borderColor} color="gray.400" >Payment Mode</Th>
                <Th borderColor={borderColor} color="gray.400" >Total Cost</Th>
                <Th borderColor={borderColor} color="gray.400" >Amount Paid</Th>
                <Th borderColor={borderColor} color="gray.400" >Online OrderID</Th>
                <Th borderColor={borderColor} color="gray.400" >Status</Th>
                <Th borderColor={borderColor} color="gray.400" >User</Th>
                <Th borderColor={borderColor} color="gray.400" >Products</Th>
                <Th borderColor={borderColor} color="gray.400" ></Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((row) => {
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
                            <Badge
                                bg={getBadgeColour(row.status)}
                                color={"white"}
                                fontSize="16px"
                                p="3px 10px"
                                borderRadius="8px"
                            >
                                {row.status}
                            </Badge>
                        </Td>
                        <Td>
                            <Button onClick={() => viewUsers({name: row.userId.name, email: row.userId.email, address: row.address, phone: row.phone})}>View</Button>
                        </Td>
                        <Td>
                            <Button onClick={() => viewProducts(row.productId, row.quantity)}>View</Button>
                        </Td>
                        <Td>
                            <Button colorScheme='blue' onClick={() => {
                            alertContent = {
                              type: 'edit',
                              title: 'Edit Status',
                              size: 'xl',
                              defaultValue: row.status,
                              orderId: row._id,
                            }; 
                            onOpen();}}>Edit</Button>
                        </Td>
                    </Tr>
                );
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      <Flex justifyContent={'center'} mt={10}>
        <Button colorScheme='blue' color='#fff' onClick={showMore} isLoading={showMoreLoading}>Show More</Button>
      </Flex>
    </Flex>
  );
}

export default Orders;
