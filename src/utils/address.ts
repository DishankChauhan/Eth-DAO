import { ethers } from 'ethers';

/**
 * Truncates Ethereum address for display purposes
 * @param address The Ethereum address to truncate
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Truncated address with ellipsis in the middle
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  
  // Validate the address format
  if (!ethers.isAddress(address)) {
    return address;
  }
  
  // If the address is shorter than the sum of start and end chars, just return it
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Checks if two addresses are the same (case-insensitive)
 * @param address1 First address to compare
 * @param address2 Second address to compare
 * @returns True if addresses are the same
 */
export function isSameAddress(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false;
  
  try {
    return address1.toLowerCase() === address2.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * Formats an Ethereum address with ENS support
 * @param address The Ethereum address to format
 * @param ensName Optional ENS name
 */
export function formatAddress(address: string, ensName?: string | null): string {
  if (ensName) return ensName;
  return truncateAddress(address);
}

/**
 * Checks if the address is a valid Ethereum address
 * @param address The address to check
 * @returns True if the address is valid
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  
  return ethers.isAddress(address);
}

/**
 * Checks if an address is a contract address
 * @param address The address to check
 * @param provider Ethers provider
 * @returns Promise resolving to true if the address is a contract
 */
export async function isContractAddress(
  address: string, 
  provider: ethers.Provider
): Promise<boolean> {
  if (!isValidAddress(address)) return false;
  
  try {
    const code = await provider.getCode(address);
    // If there's deployed code at this address, it's a contract
    return code !== '0x';
  } catch (error) {
    console.error('Error checking if address is contract:', error);
    return false;
  }
} 