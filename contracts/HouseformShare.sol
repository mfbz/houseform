// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@klaytn/contracts/KIP/token/KIP37/KIP37.sol';
import '@klaytn/contracts/KIP/token/KIP37/extensions/KIP37Burnable.sol';
import '@klaytn/contracts/access/Ownable.sol';
import '@klaytn/contracts/utils/Base64.sol';

// NB: The id of the token to be minted is the project id so that they can be easily referenced
contract HouseformShare is KIP37, KIP37Burnable, Ownable {
	struct Metadata {
		string name;
		string description;
		string image;
	}

	string public name = 'HouseformShare';
	string public symbol = 'HS';

	mapping(uint => Metadata) public idToMetadata;

	constructor() KIP37('') {}

	function setMetadata(
		uint _id,
		string memory _name,
		string memory _description,
		string memory _image
	) public onlyOwner {
		idToMetadata[_id] = Metadata({name: _name, description: _description, image: _image});
	}

	function mint(address _account, uint256 _id, uint256 _amount, bytes memory _data) public onlyOwner {
		_mint(_account, _id, _amount, _data);
	}

	function mintBatch(
		address _to,
		uint256[] memory _ids,
		uint256[] memory _amounts,
		bytes memory _data
	) public onlyOwner {
		_mintBatch(_to, _ids, _amounts, _data);
	}

	function burn(address _account, uint256 _id, uint256 _amount) public override onlyOwner {
		_burn(_account, _id, _amount);
	}

	function burnBatch(address _account, uint256[] memory _ids, uint256[] memory _amounts) public override onlyOwner {
		_burnBatch(_account, _ids, _amounts);
	}

	function uri(uint256 _id) public view override returns (string memory) {
		Metadata memory metadata = idToMetadata[_id];
		// Return stringified data uri
		return
			string(
				abi.encodePacked(
					'data:application/json;base64,',
					Base64.encode(
						bytes(
							string(
								abi.encodePacked(
									'{ "name": "',
									metadata.name,
									'", "description": "',
									metadata.description,
									'", "image": "',
									metadata.image,
									'"}'
								)
							)
						)
					)
				)
			);
	}

	// Override required by Solidity
	function supportsInterface(bytes4 _interfaceId) public view override(KIP37, KIP37Burnable) returns (bool) {
		return super.supportsInterface(_interfaceId);
	}
}
