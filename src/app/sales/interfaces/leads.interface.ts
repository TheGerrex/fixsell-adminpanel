// {
//     "id": 8,
//     "client": "John Doe2",
//     "status": "prospect",
//     "product_interested": "Product1",
//     "type_of_product": "consumible",
//     "email": "johndoe@example.com",
//     "phone": "+1234567890",
//     "communications": [
//         {
//             "id": 1,
//             "message": "This is a sales communication message",
//             "date": "2022-01-01T00:00:00.000Z",
//             "type": null,
//             "notes": null
//         },
//         {
//             "id": 2,
//             "message": "This is a sales communication message",
//             "date": "2022-01-01T00:00:00.000Z",
//             "type": "email",
//             "notes": null
//         }
//     ],
//     "assigned": {
//         "id": "69036d41-55e4-4edd-b609-7ed56de18b3c",
//         "email": "Jane@sales.mx",
//         "name": "Jane Smith",
//         "password": "$2a$10$aDDLaiNbCp7ICeW2nUS1ZOqMeAa1eQlUnwWHm9TZDtyEstJr382E6",
//         "isActive": true
//     }
// }

import { User } from 'src/app/auth/interfaces';

export interface Lead {
  id: number;
  client: string;
  status: string;
  product_interested: string;
  type_of_product: string;
  email: string;
  phone: string;
  communications: Communication[];
  assigned: User;
}

export interface Communication {
  id: number;
  message: string;
  date: string;
  type: string;
  notes: string;
  lead: Lead;
}
