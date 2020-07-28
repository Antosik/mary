import { promises as DNSPromises, LookupAllOptions } from "dns";
import { hostname } from "os";


export async function getMyIPAddress(options: LookupAllOptions = { all: true, family: 4 }): Promise<string[]> {
  const addresses = await DNSPromises.lookup(hostname(), options);
  return addresses.map(address => address.address);
}