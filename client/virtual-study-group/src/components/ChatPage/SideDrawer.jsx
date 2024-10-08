import { useState } from "react"
import {Button} from '@chakra-ui/button'
import { Box, Text } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import {Menu, MenuButton, MenuList, MenuItem} from '@chakra-ui/menu'
import {Avatar} from '@chakra-ui/avatar'
import { useDisclosure } from "@chakra-ui/hooks"
import {Drawer, DrawerContent, DrawerOverlay, DrawerHeader, DrawerBody} from '@chakra-ui/modal'
import {BellIcon, ChevronDownIcon} from "@chakra-ui/icons"
import { Input } from "@chakra-ui/input";
import { Toast, useToast } from "@chakra-ui/react";
import {Spinner} from "@chakra-ui/spinner"
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "./ChatLogics";
import NotificationBadge,{Effect} from "react-notification-badge"


const SideDrawer=()=>{

    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState(false)
    const name= localStorage.getItem('name')
    const token = localStorage.getItem('token')
    const id = localStorage.getItem('id')
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {chats, setChats, selectedChat, setSelectedChat, notification, setNotification}= ChatState()

    const user = {
        name: localStorage.getItem('name'),
        token: localStorage.getItem('token'),
        id: localStorage.getItem('id'),
        email: localStorage.getItem('email')
      };
    
    const toast= useToast()
    const handleSearch=async()=>{

        if(!search){
            toast({
               title:"Please Enter something in search",
               status: "warning",
               duration: 5000,
               isClosable: true,
               position:"top-left",   
            });
            return;
        }

        try{
             setLoading(true)
             const config={
                headers:{
                    Authorization: `Bearer ${token}`
                }
             }
             const {data}= await axios.get(`http://localhost:3001/auth/users1?search=${search}`, config)
             console.log(data)
             if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
             }
             setLoading(false)
             setSearchResult(data)
        }catch(error){
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
        }
    }

    const accessChat = async (userId) => {
       console.log("hello")
        try {
          setLoadingChat(true);
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.post(`http://localhost:3001/chat`, { userId }, config);

          console.log(data)
    
         // if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title: "Error fetching the chat",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };
    return <>
        <Box  display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px">
            <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
                <Button variant="ghost" onClick={onOpen}>
                    <i className="fas fa-search"></i>
                    <Text d={{base:"none",md:"flex"}} px="4">
                        Search User
                    </Text>
                </Button>
                  
            </Tooltip>
            <div>
                <Menu>
                    <MenuButton p={1}>
                          <NotificationBadge 
                           count={notification.length}
                           effect={Effect.SCALE}/>
                          <BellIcon fontSize="2x1" m={1} />
                    </MenuButton>
                    <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                        <Avatar size="sm" cursor="pointer" name={name}/>
                    </MenuButton>
                </Menu>
            </div>
        </Box>
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay/>
            <DrawerContent>
                <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            <DrawerBody>
            <Box display="flex" pb={2}>
                <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button 
                onClick={handleSearch}
              >Go</Button>
            </Box>
            {loading?(
                <ChatLoading/>
            ):( 
                searchResult?.map((user)=>(
                    <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={()=>accessChat(user._id)}/>
                ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex"/>}
            </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>
}

export default SideDrawer