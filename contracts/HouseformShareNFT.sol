// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract HouseformShareNFT is ERC721, Ownable {
	constructor() ERC721('HouseformShareNFT', 'HS') {}

	function mintShares(address _to, uint256 _projectId, uint256 _amount) external onlyOwner {
		uint256 tokenId = totalSupply() + 1;
		_mint(_to, tokenId);
		_setTokenURI(tokenId, string(abi.encodePacked(_projectId, '-', _amount)));
	}

	function burnShares(uint256 _tokenId) external onlyOwner {
		_burn(_tokenId);
	}

	function getTokenProjectId(uint256 _tokenId) external view returns (uint256) {
		require(_exists(_tokenId), 'Token does not exist');
		string memory tokenURI = tokenURI(_tokenId);
		bytes memory tokenIdBytes = bytes(tokenURI);
		uint256 projectId = 0;

		for (uint256 i = 0; i < tokenIdBytes.length; i++) {
			if (tokenIdBytes[i] == '-') {
				projectId = parseInt(tokenURI, i + 1);
				break;
			}
		}

		return projectId;
	}

	function getTokenAmount(uint256 _tokenId) external view returns (uint256) {
		require(_exists(_tokenId), 'Token does not exist');
		string memory tokenURI = tokenURI(_tokenId);
		bytes memory tokenIdBytes = bytes(tokenURI);
		uint256 amount = 0;

		for (uint256 i = 0; i < tokenIdBytes.length; i++) {
			if (tokenIdBytes[i] == '-') {
				amount = parseInt(tokenURI, i + 1);
				break;
			}
		}

		return amount;
	}

	function parseInt(string memory _value, uint256 _startIndex) internal pure returns (uint256) {
		uint256 result = 0;
		for (uint256 i = _startIndex; i < bytes(_value).length; i++) {
			if ((uint8(bytes(_value)[i]) >= 48) && (uint8(bytes(_value)[i]) <= 57)) {
				result = result * 10 + (uint8(bytes(_value)[i]) - 48);
			}
		}
		return result;
	}
}
