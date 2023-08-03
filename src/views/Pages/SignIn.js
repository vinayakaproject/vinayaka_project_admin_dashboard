import React, { useState, useEffect } from "react";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import supabaseClient from "utils/supabaseClient";
import { useGlobalContext } from "utils/context";
import { useHistory } from "react-router-dom";

function SignIn() {
  // Chakra color mode
  const toast = useToast()
  const history = useHistory();

  const { user, setUser } = useGlobalContext();

  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const [btnLoading, setbtnLoading] = useState(false);

  useEffect(() => { 
    console.log(user)
    if(user) {
      history.push('/admin/dashboard')
    }
  }, [user])

  const signIn = async () => { 
    setbtnLoading(true)
    const { data, error } = await supabaseClient.auth.signInWithPassword({email, password: pwd})
    if(error) {
      toast({
        title: "Error",
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    if(data) {
      console.log(data)
      if(data.user.email !== "vinayakaproject23@gmail.com") {
        toast({
          title: "Error",
          description: "User not authorised",
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
        await supabaseClient.auth.signOut()
      }else {
        setUser(data.user)
      }
    } 
    setbtnLoading(false)
  }
  
  return (
    <Flex position='relative' mb='40px'>
      <Flex
        minH={{ md: "500px" }}
        h={{ sm: "initial", md: "75vh", lg: "85vh" }}
        w='100%'
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        mb='30px'
        pt={{ md: "0px" }}>
        <Flex
          w='100%'
          h='100%'
          alignItems='center'
          justifyContent='center'
          mb='60px'
          mt={{ base: "50px", md: "20px" }}>
          <Flex
            zIndex='2'
            direction='column'
            w='445px'
            background='transparent'
            borderRadius='15px'
            p='40px'
            mx={{ base: "100px" }}
            m={{ base: "20px", md: "auto" }}
            bg={bgForm}
            boxShadow={useColorModeValue(
              "0px 5px 14px rgba(0, 0, 0, 0.05)",
              "unset"
            )}>
            <Text
              fontSize='xl'
              color={textColor}
              fontWeight='bold'
              textAlign='center'
              mb='22px'>
              Admin Login
            </Text>
            <FormControl>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Admin Email
              </FormLabel>
              <Input
                variant='auth'
                fontSize='sm'
                ms='4px'
                type='email'
                placeholder='Email'
                mb='24px'
                size='lg'
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Admin Password
              </FormLabel>
              <Input
                variant='auth'
                fontSize='sm'
                ms='4px'
                type='password'
                placeholder='Password'
                mb='24px'
                size='lg'
                onChange={(e) => setPwd(e.target.value)}
              />
              <Button
                fontSize='10px'
                fontWeight='bold'
                w='100%'
                h='45'
                mb='24px'
                isLoading={btnLoading}
                onClick={signIn}>
                Login
              </Button>
            </FormControl>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignIn;
