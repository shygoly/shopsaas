"use strict";
`` `tsx
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  Avatar,
  Navigation,
  NavLink,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  DataTable,
  Table,
  Th,
  Td,
  Tbody,
  TdData,
  Tr,
  Thead,
  Pagination,
  PaginationItem,
  PaginationButton,
  PaginationSeparator
} from '@radix-ui/react-components';
import '@radix-ui/react-primitive/primitive.css';
import './App.css';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <div className="wrapper">
      <Sidebar onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SidebarTrigger>Open Sidebar</SidebarTrigger>
        <SidebarContent>
          <div className="sidebar">
            <div className="user-info">
              <Avatar />
              <div className="user-details">John Doe</div>
            </div>
            <Navigation>
              <NavLink>Home</NavLink>
              <NavLink>Profile</NavLink>
              <NavLink>Settings</NavLink>
            </Navigation>
            <div className="actions">
              <Button>Create Product</Button>
              <a href="#">Settings</a>
              <a href="#">Help</a>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <main className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
          <section className="credit-summary">Credit Balance: $1,000</section>
        </div>
        <section className="transaction-history">
          <header>Transaction History</header>
          <div className="table-container">
            <DataTable>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Amount</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <TdData>2023-04-01</TdData>
                    <TdData>$100</TdData>
                    <TdData>Payment</TdData>
                  </Tr>
                  {/* More rows */}
                </Tbody>
              </Table>
            </DataTable>
            <Pagination>
              <PaginationItem>
                <PaginationButton onClick={() => setCurrentPage(1)}>1</PaginationButton>
              </PaginationItem>
              <PaginationSeparator>...</PaginationSeparator>
              <PaginationItem>
                <PaginationButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </PaginationButton>
              </PaginationItem>
              <PaginationItem>
                <PaginationButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === 10}>
                  Next
                </PaginationButton>
              </PaginationItem>
              <span>Showing 1-10 of 100 entries</span>
            </Pagination>
          </div>
        </section>
        <section className="active-ai-services">
          <header>Active AI Services</header>
          <div className="ai-services-grid">
            <Card>
              <CardHeader>Service 1</CardHeader>
              <CardBody>Description of Service 1</CardBody>
              <CardFooter>Footer of Service 1</CardFooter>
            </Card>
            {/* More cards */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
` ``;
//# sourceMappingURL=CreditAndBilling.js.map