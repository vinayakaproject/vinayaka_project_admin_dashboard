import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  useToast,
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  useDisclosure,
  Image,
  Select,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons'
import Loading from "components/Loading/Loading";
import { userFun } from "utils/utilites";
import supabaseClient from 'utils/supabaseClient';
import { createObjectID }  from 'mongo-object-reader';
import { useHistory } from 'react-router-dom';

const operators = [
  { label: 'Equals', value: '$eq' },
  { label: 'Not equal', value: '$ne' },
  { label: 'Greater Than', value: '$gt' },
  { label: 'Less Than', value: '$lt' },
  { label: 'Greater Than or Equal to', value: '$gte' },
  { label: 'Less Than or Equal to', value: '$lte' },
  { label: 'In', value: '$in' },
]

const productParams = [
  { label: 'Id', value: '_id' },
  { label: 'Name', value: 'name' },
  { label: 'Price', value: 'price' },
  { label: 'Category', value: 'category' },
  { label: 'Net Weight', value: 'net_weight' },
]

const ProductCard = ({ product, onEdit, onDelete, onViewOrder }) => (
  <Box borderWidth="1px" borderRadius="md" p="4" bgColor={'#fff'} shadow="md">
    <Box as="h2" fontSize="md" pr={20} fontWeight="semibold">
      Product ID: {product._id}
    </Box>
    <Box mt="2" width={'10vw'} height={'10vh'}>
      <Image src={product.image} width={'full'} height={'full'} objectFit={'contain'} alt={product.name} />
    </Box>
    <Box mt="2" color="gray.600">
      Product Name: {product.name}
    </Box>
    <Box mt="2" color="gray.600" noOfLines={1}>
      Description: {product.description ? product.description : "null"}
    </Box>
    <Box mt="2" color="gray.600">
      Price: ₹{product.price}
    </Box>
    <Box mt="2" color="gray.600">
      Category: {product.category}
    </Box>
    <Box mt="2" color="gray.600">
      Net Weight: {product.net_weight}
    </Box>

    <Button mt="3" colorScheme='blue' onClick={() => onViewOrder(product._id)}>View Orders</Button>
    <Button mt="3" ml="2" onClick={() => onEdit(product)}>Edit</Button>
    <Button mt="3" ml="2" colorScheme='red' onClick={() => onDelete(product)}>Delete</Button>
  </Box>
);

const Products = () => {
  const toast = useToast()

  const history = useHistory();

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const prodFetchedRef = useRef(false)

  var allProducts = localStorage.getItem('allProducts') ? JSON.parse(localStorage.getItem('allProducts')) : [];
  const productsFilters = localStorage.getItem('productsFilters') ? JSON.parse(localStorage.getItem('productsFilters')) : [];
  const productQuery = localStorage.getItem('productsQuery') ? JSON.parse(localStorage.getItem('productsQuery')) : {};

  const [loading, setLoading] = useState(true);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [filterModel, setfilterModel] = useState(false);
  const [filters, setfilters] = useState(productsFilters);
  const [query, setQuery] = useState(productQuery);
  const [products, setProducts] = useState(allProducts);
  const [createBtnLoad, setcreateBtnLoad] = useState(false);
  const [editBtnLoad, seteditBtnLoad] = useState(false);
  const [applyFilterLoad, setapplyFilterLoad] = useState(false);
  const [deleteConLoad, setdeleteConLoad] = useState(false);
  const [showMoreLoading, setshowMoreLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cat, setCat] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const getImgPath = (image, prodId) => { 
    const imageType = image.type;
    const parts = imageType.split('/');
    const imageExtension = parts[parts.length - 1];
    const imageName = prodId + '.' + imageExtension;
    const imgPath = 'Public/' + imageName;
    return imgPath;
  }

  const handleCreateProduct = async () => {
    setcreateBtnLoad(true);
    if(name === "" || cat === "" || weight === "" || price === "" || !image) { 
        toast({
            title: 'Error',
            description: 'Please fill all the fields',
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }else {
        toast({
            description: 'Uploading Images.... Please wait.....',
            status: 'info',
            duration: 9000,
            isClosable: true,
        });

        const prodId = createObjectID();

        console.log(prodId);

        const imgPath = getImgPath(image, prodId);

        const { data, error } = await supabaseClient.storage
          .from('vinayaka')
          .upload(imgPath, image, {
              upsert: true,
          });

        if (error) {
            toast({
                title: 'Error',
                description: 'There was an error uploading image. Please make sure you have stable internet connection and try again',
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
        if (data) {
            const {
                data: { publicUrl }, error
            } = await supabaseClient.storage.from('vinayaka').getPublicUrl(imgPath);

            const mainurl = publicUrl.toString() + "?" + new Date().getTime();

            toast({
                description: 'Image Uploaded successfully. Saving Products....',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });

            const product = await userFun('addProducts', { 
                _id: prodId,
                name,
                description,
                category: cat,
                net_weight: weight,
                price,
                image: mainurl,
            }, 'POST');
            
            if(product.status === 201) {
                window.location.reload();
            }else {
                toast({
                    title: 'Error',
                    description: product.message,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            }
        }
    }
    setcreateBtnLoad(false);
  };

  const fetchProducts = useCallback(async () => {
    console.log("In fetch")
    setLoading(true);
    console.log(query)
    console.log(products.length)
    const productsFetch = await userFun('getAllProducts', {
      query: query,
      skip: products.length
    }, 'POST');
    
    if(productsFetch.status === 201) {
      console.log(productsFetch); 
      console.log(products);   
      if(productsFetch.message.length === 0) {
        toast({
            title: '',
            description: "No products to show",
            status: 'warning',
            duration: 9000,
            isClosable: true,
        })
      }else {
        const newProducts = [...products, ...productsFetch.message] 
        localStorage.setItem('allProducts', JSON.stringify(newProducts))
        setProducts(newProducts)
      }
    }else {
        toast({
            title: 'Error',
            description: productsFetch.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }
    console.log("Returned");
    setLoading(false);
  }, [products, query]) 

  useEffect(() => {
    console.log("In effect");
    console.log(prodFetchedRef.current);
    if(prodFetchedRef.current) return;
    prodFetchedRef.current = true;
    allProducts.length === 0 && fetchProducts()
    window.onbeforeunload = function () {
      console.log("In onbeforeunload");
      localStorage.removeItem('allProducts')
    };
  }, [allProducts])

  const handleEditProduct = (productToEdit) => {
    console.log(productToEdit)
    setName(productToEdit.name);
    setDescription(productToEdit.description);
    setCat(productToEdit.category);
    setWeight(productToEdit.net_weight);
    setPrice(productToEdit.price);
    setEditingProduct(productToEdit);
  };

  const handleViewOrders = (prodId) => {
    const productOrderQuery = {
      productId: prodId,
    }
    localStorage.setItem("productOrderQuery", JSON.stringify(productOrderQuery));
    localStorage.removeItem('allOrders');
    history.push('/admin/orders');
  };

  const handleSaveEdit = async (editedProduct) => {
    seteditBtnLoad(true);
    var imgUploadError = false;
    var mainurl = editedProduct.image;
    if(name === "" || cat === "" || weight === "" || price === "") { 
        toast({
            title: 'Error',
            description: 'Please fill all the fields',
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }else {
        if(image) {
            toast({
                description: 'Uploading Images.... Please wait.....',
                status: 'info',
                duration: 9000,
                isClosable: true,
            });

            const imgPath = getImgPath(image, editedProduct._id);
            const { data, error } = await supabaseClient.storage
                .from('vinayaka')
                .upload(imgPath, image, {
                    upsert: true,
                });
    
            if (error) {
                imgUploadError = true;
            }
            if(data) {
                const {
                    data: { publicUrl }, error
                } = await supabaseClient.storage.from('vinayaka').getPublicUrl(imgPath);
    
                mainurl = publicUrl.toString() + "?" + new Date().getTime();
    
                if(error) {
                    imgUploadError = true;
                }else {
                    toast({
                        description: 'Image Uploaded successfully. Saving Products....',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        }
        if(imgUploadError === false) {
            const product = await userFun('updateProduct', { 
              prodId: editedProduct._id,
              updateData: {
                name,
                description,
                category: cat,
                net_weight: weight,
                price,
                image: mainurl,
              }
            }, 'POST');
            
            if(product.status === 201) {
                var targetProd = products.find((product) => product._id === editedProduct._id)
                console.log(targetProd)
                if(targetProd) {
                  targetProd.name = name;
                  targetProd.description = description;
                  targetProd.category = cat;
                  targetProd.net_weight = weight;
                  targetProd.price = price;
                  targetProd.image = mainurl;
                  const updatedProducts = [...products]
                  localStorage.setItem('allProducts', JSON.stringify(updatedProducts))
                  setProducts(updatedProducts);
                }
            }else {
                toast({
                    title: 'Error',
                    description: product.message,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            }
        }else {
            toast({
                title: 'Error',
                description: 'There was an error uploading image. Please make sure you have stable internet connection and try again',
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
    }
    seteditBtnLoad(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (product) => {
    setDeletingProduct(product);
    onOpen()
  };

  const deleteProduct = async () => {
    setdeleteConLoad(true);

    const productConfirmDelete = await userFun('confrimProductDelete', { prodId: deletingProduct._id }, 'POST');

    if(productConfirmDelete.status === 201) { 

      const imgPathSplit = deletingProduct.image.split('/');
      const imgPath = 'Public/' + imgPathSplit[imgPathSplit.length - 1].split('?')[0];
      console.log(imgPath);

      const { data, error } = await supabaseClient.storage
      .from('vinayaka')
      .remove([imgPath]);
      if(error) {
        //Image Delete Error
        toast({
            title: 'Error',
            description: product.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
      }
      if(data) {
        const product = await userFun('deleteProduct', { prodId: deletingProduct._id }, 'POST');
        if(product.status === 201) {
          const updatedProducts = products.filter((product) => product._id !== deletingProduct._id)
          if(updatedProducts.length === 0) { 
            localStorage.removeItem('allProducts');
            prodFetchedRef.current = false;
            allProducts = [];
            setProducts(allProducts);
          }else {
            localStorage.setItem('allProducts', JSON.stringify(updatedProducts))
            setProducts(updatedProducts);
          }
          onClose()
        }else {
            //Delete Error
            toast({
                title: 'Error',
                description: product.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
      }
    }else {
      //Not confirmed
      toast({
          title: 'Error',
          description: productConfirmDelete.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
      })
    }
    setdeleteConLoad(false);
  }

  const showMore = async () => { 
    setshowMoreLoading(true);
    fetchProducts().then(() => { 
      setshowMoreLoading(false);
    });
  }

  const addFilter = () => {
    const newFilter = {
      field: "",
      operator: "",
      value: "",
    }
    setfilters([...filters, newFilter]);
  }
  
  const applyFilter = async () => { 
    setapplyFilterLoad(true);
    console.log(filters);
    const emptyFilter = filters.filter((filter) => filter.field === "" || filter.operator === "" || filter.value === "");
    if(emptyFilter.length > 0) { 
      toast({
        title: 'Error',
        description: 'Please fill all the filter fields',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }else {
      var queryLoc = {};
      filters.map((filter) => {
        const fieldOperator = filter.operator.toString();
        return queryLoc[filter.field] = {
          [fieldOperator]: filter.value
        }
      });
      console.log(queryLoc);
      setQuery(queryLoc);
      localStorage.setItem('productsQuery', JSON.stringify(queryLoc));
      localStorage.setItem('productsFilters', JSON.stringify(filters));
      localStorage.removeItem('allProducts');
      prodFetchedRef.current = false;
      allProducts = [];
      setProducts(allProducts);
    }
    setapplyFilterLoad(false);
    setfilterModel(false);
  }

  if(loading === true && products.length === 0) return <Loading mt={10} pt={20} color={'#fff'} />;
  return (
    <Box p="4" mt={20}>
      <Flex justifyContent="space-between" alignItems="center">
        <Button onClick={() => setIsCreatingProduct(true)}>Create Product</Button>
        <Button onClick={() => setfilterModel(true)}>{filters.length > 0 ? `${filters.length} active ` : ``} Filter{filters.length > 1 ? 's' : ''}</Button>
      </Flex>
      <Box mt="4">
        <Grid templateColumns='repeat(3, 1fr)' gap={6}>
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onViewOrder={handleViewOrders}
            />
          ))}
        </Grid>
      </Box>
      {
        products.length > 0 && <Flex justifyContent={'center'} mt={10}>
          <Button colorScheme='blue' color='#fff' onClick={showMore} isLoading={showMoreLoading}>Show More</Button>
        </Flex>
      }

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} isDisabled={deleteConLoad} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' isLoading={deleteConLoad} onClick={deleteProduct} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal isOpen={filterModel} onClose={() => setfilterModel(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter Products</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {
              filters.length > 0 && filters.map((filter, index) => (
              <Flex key={index} gap={5} mt={index === 0 ? 0 : 5}>
                <FormControl>
                    <FormLabel>Field</FormLabel>
                    <Select variant="filled" defaultValue={filter.field} onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[index].field = e.target.value;
                      setfilters(newFilters);
                    }} placeholder='Select option'>
                      {
                        productParams.map((param) => ( 
                          <option value={param.value}>{param.label}</option>
                        ))
                      }
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Operator</FormLabel>
                    <Select variant="filled" defaultValue={filter.operator} onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[index].operator = e.target.value;
                      setfilters(newFilters);
                    }}  placeholder='Select option'>
                      {
                        operators.map((param) => ( 
                          <option value={param.value}>{param.label}</option>
                        ))
                      }
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Value</FormLabel>
                    <Input defaultValue={filter.value} type='text' onChange={(e) => {
                      const newFilters = [...filters];
                      newFilters[index].value = e.target.value;
                      setfilters(newFilters);
                    }}  placeholder='Enter Value here...' />
                </FormControl>
                <Flex mt={43} onClick={() => {
                  const newFilters = [...filters];
                  newFilters.splice(index, 1);
                  setfilters(newFilters);
                }} cursor={'pointer'}>
                  <CloseIcon color={'gray.500'} />
                </Flex>
              </Flex>
              ))
            }
            <Flex mt={5} gap={3}>
              <Button onClick={addFilter}>Add Filter</Button> 
              {
                filters.length > 0 && <Button colorScheme='red' onClick={() => setfilters([])}>Reset</Button>
              }
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} isLoading={applyFilterLoad} onClick={applyFilter}>
              Apply Filter
            </Button>
            <Button onClick={() => setfilterModel(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreatingProduct} onClose={() => setIsCreatingProduct(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Products</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
                <FormLabel>Name</FormLabel>
                <Input type='text' placeholder='Enter Product Name' onChange={(e) => setName(e.target.value)}/>
            </FormControl>
            <FormControl>
                <FormLabel>Description</FormLabel>
                <Input type='text' placeholder='Enter Product Description' onChange={(e) => setDescription(e.target.value)}/>
            </FormControl>
            <FormControl mt={5}>
                <FormLabel>Category</FormLabel>
                <Input placeholder='Enter Product Category' onChange={(e) => setCat(e.target.value)}/>
            </FormControl>
            <FormControl mt={5}>
                <FormLabel>Net Weight</FormLabel>
                <Input placeholder='Enter Product Net Weight (Example - 22g)' onChange={(e) => setWeight(e.target.value)}/>
            </FormControl>
            <FormControl mt={5}>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                    <InputLeftElement
                        pointerEvents='none'
                        color='gray.300'
                        fontSize='1.2em'
                        children='₹'
                    />
                    <Input type={'number'} placeholder='Enter Product Prize' onChange={(e) => setPrice(e.target.value)} />
                </InputGroup>
            </FormControl>
            <FormControl mt={5}>
                <FormLabel>Image</FormLabel>
                <Input type='file' accept='image/*' placeholder='Enter Product Net Weight' onChange={(e) => setImage(e.target.files[0])}/>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} isLoading={createBtnLoad} onClick={handleCreateProduct}>
              Create
            </Button>
            <Button onClick={() => setIsCreatingProduct(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {editingProduct && (
        <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input type='text' placeholder='Enter Product Name' defaultValue={editingProduct.name} onChange={(e) => setName(e.target.value)}/>
                </FormControl>
                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input type='text' placeholder='Enter Product Description' defaultValue={editingProduct.description} onChange={(e) => setDescription(e.target.value)}/>
                </FormControl>
                <FormControl mt={5}>
                    <FormLabel>Category</FormLabel>
                    <Input placeholder='Enter Product Category' defaultValue={editingProduct.category} onChange={(e) => setCat(e.target.value)}/>
                </FormControl>
                <FormControl mt={5}>
                    <FormLabel>Net Weight</FormLabel>
                    <Input placeholder='Enter Product Net Weight (Example - 22g)' defaultValue={editingProduct.net_weight} onChange={(e) => setWeight(e.target.value)}/>
                </FormControl>
                <FormControl mt={5}>
                    <FormLabel>Price</FormLabel>
                    <InputGroup>
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            fontSize='1.2em'
                            children='₹'
                        />
                        <Input type={'number'} placeholder='Enter Product Prize' onChange={(e) => setPrice(e.target.value)} defaultValue={editingProduct.price} />
                    </InputGroup>
                </FormControl>
                <FormControl mt={5}>
                    <FormLabel>Image</FormLabel>
                    <Image src={editingProduct.image} width={50} height={50} objectFit={'cover'} />
                    <Input type='file' accept='image/*' mt={5} placeholder='Enter Product Net Weight' onChange={(e) => setImage(e.target.files[0])}/>
                </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} isLoading={editBtnLoad} onClick={() => handleSaveEdit(editingProduct)}>
                Save
              </Button>
              <Button onClick={() => setEditingProduct(null)}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Products;