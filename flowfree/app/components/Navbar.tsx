"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import {Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import {Select, SelectItem} from "@nextui-org/select"
export default function NavbarComponent() {
  const router = useRouter();
  const [boardSize, setBoardSize] = useState(5);
  const handleMultiplayer = () => {
    localStorage.setItem('boardSize', boardSize.toString())
    router.push("/duel/")
  }

  const menuItems = [
    "Practice",
    "Multiplayer"
  ];

  const multiOptions = [
    {
      key: 5,
      label: "5 x 5",
    },
    {
      key: 6,
      label: "6 x 6",
    },
    {
      key: 7,
      label: "7 x 7",
    },
    {
      key: 8,
      label: "8 x 8",
    },
    {
      key: 9,
      label: "9 x 9",
    }
  ]

  return (
    <>
    <Navbar
    shouldHideOnScroll isBordered className='py-4'>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="start">
        <NavbarBrand>
          
          <h5 className="font-bold text-inherit">Flow Free</h5>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          
          <h5 className="font-bold text-inherit">Flow Free</h5>
        </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex" justify='center'>
        <NavbarItem>
        <a href="/practice">
          <Button
              className="text-white p-4"
              // endContent={icons.chevron}
              radius="sm"
              variant="bordered"
            >
            <div className='text-white'>
              <h6>
              Practice
              </h6>
            </div>
            </Button>
            </a>
        </NavbarItem>
        {/* <NavbarItem>
        
        </NavbarItem>      */}
      </NavbarContent>
      <NavbarContent>
      <Select 
        label="Multiplayer" 
        size='lg'
        variant='bordered'
        defaultSelectedKeys={[boardSize]}
        onChange={(e) => setBoardSize(Number(e.target.value))}
        style={{borderRadius:"10px", border:"solid 2px white"}}
        classNames={{
          popoverContent:"bg-black border-1 z-2",
          value:"text-white",
          label:"text-white",
          trigger:"text-white",
          mainWrapper:"rounded-lg"
        }}
      >
        {multiOptions.map((board) => (
          <SelectItem key={board.key}>
            {board.label}
          </SelectItem>
        ))}
      </Select>
      <Button onClick={handleMultiplayer} variant='bordered' className='text-white'>
        Go
        </Button>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="warning" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full text-white"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
    <div className='m-2 w-full bg-white' style={{height:"0.05px"}}></div>
    
    {/* <div className="bg-black h-full text-center align-items-center gap-4">
      <div className='flex flex-row'>
        <button className="bg-white rounded text-black px-4" onClick={handleMultiplayer}>Multiplayer</button>
        <input placeholder="Enter board size: " className="w-full rounded p-2 text-black" type="number" defaultValue={boardSize} onChange={(num) => setBoardSize(Number(num.target.value))}/>
      </div>
    <button className="bg-white rounded text-black px-4" onClick={() => router.push("/drag")}>Drag test</button>
    </div> */}
    </>
  )
}
