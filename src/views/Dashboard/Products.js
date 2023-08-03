import React, { useEffect, useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import Loading from "components/Loading/Loading";
import { userFun } from "utils/utilites";
import supabaseClient from 'utils/supabaseClient';
import { createObjectID }  from 'mongo-object-reader';

const ProductCard = ({ product, onEdit, onDelete }) => (
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
    <Box mt="2" color="gray.600">
      Price: ₹{product.price}
    </Box>
    <Box mt="2" color="gray.600">
      Category: {product.category}
    </Box>
    <Box mt="2" color="gray.600">
      Net Weight: {product.net_weight}
    </Box>

    <Button mt="3" onClick={() => onEdit(product)}>Edit</Button>
    <Button mt="3" ml="2" colorScheme='red' onClick={() => onDelete(product)}>Delete</Button>
  </Box>
);

const Products = () => {
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const allProducts = localStorage.getItem('allProducts') ? JSON.parse(localStorage.getItem('allProducts')) : [];

  const [loading, setLoading] = useState(true);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [products, setProducts] = useState(allProducts);
  const [createBtnLoad, setcreateBtnLoad] = useState(false);
  const [editBtnLoad, seteditBtnLoad] = useState(false);
  const [deleteConLoad, setdeleteConLoad] = useState(false);
  const [showMoreLoading, setshowMoreLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [name, setName] = useState("");
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

  const fetchProducts = async () => {
    console.log("In fetch")
    setLoading(true);
    console.log(products.length)
    const productsFetch = await userFun('getAllProducts', {
      skip: products.length
    }, 'POST');
    
    if(productsFetch.status === 201) {
      console.log(productsFetch);    
      const newProducts = [...products, ...productsFetch.message] 
      localStorage.setItem('allProducts', JSON.stringify(newProducts))
      setProducts(newProducts)
    }else {
        toast({
            title: 'Error',
            description: productsFetch.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }
    setLoading(false);
  }

  useEffect(() => {
    console.log("In use effect")
    console.log(allProducts)
    allProducts.length === 0 && fetchProducts()
    window.onbeforeunload = function () {
      console.log("In onbeforeunload");
      localStorage.removeItem('allProducts')
    };
  }, [])

  const handleEditProduct = (productToEdit) => {
    console.log(productToEdit)
    setName(productToEdit.name);
    setCat(productToEdit.category);
    setWeight(productToEdit.net_weight);
    setPrice(productToEdit.price);
    setEditingProduct(productToEdit);
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
            fetchProducts();
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
  
  if(loading === true && products.length === 0) return <Loading mt={10} pt={20} color={'#fff'} />;
  return (
    <Box p="4" mt={20}>
      <Flex justifyContent="space-between" alignItems="center">
        <Button onClick={() => setIsCreatingProduct(true)}>Create Product</Button>
      </Flex>
      <Box mt="4">
        <Grid templateColumns='repeat(3, 1fr)' gap={6}>
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </Grid>
      </Box>
      <Flex justifyContent={'center'} mt={10}>
        <Button colorScheme='blue' color='#fff' onClick={showMore} isLoading={showMoreLoading}>Show More</Button>
      </Flex>

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