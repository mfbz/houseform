// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@klaytn/contracts/KIP/token/KIP37/KIP37.sol';
import '@klaytn/contracts/KIP/token/KIP37/extensions/KIP37Burnable.sol';
import '@klaytn/contracts/access/Ownable.sol';

// NB: The id of the token to be minted is the project id so that they can be easily referenced
contract HouseformShare is KIP37, KIP37Burnable, Ownable {
	string public name = 'HouseformShare';
	string public symbol = 'HS';

	constructor() KIP37('') {}

	function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
		_mint(account, id, amount, data);
	}

	function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
		_mintBatch(to, ids, amounts, data);
	}

	function burn(address account, uint256 id, uint256 amount) public override onlyOwner {
		_burn(account, id, amount);
	}

	function burnBatch(address account, uint256[] memory ids, uint256[] memory amounts) public override onlyOwner {
		_burnBatch(account, ids, amounts);
	}

	function balanceOf(address owner, uint256 id) public view override returns (uint256) {
		return balanceOf(owner, id);
	}

	// Override required by Solidity
	function supportsInterface(bytes4 interfaceId) public view override(KIP37, KIP37Burnable) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}
