import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AuthorizerChanged } from "../generated/schema"
import { AuthorizerChanged as AuthorizerChangedEvent } from "../generated/Vault/Vault"
import { handleAuthorizerChanged } from "../src/vault"
import { createAuthorizerChangedEvent } from "./vault-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let newAuthorizer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAuthorizerChangedEvent = createAuthorizerChangedEvent(newAuthorizer)
    handleAuthorizerChanged(newAuthorizerChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AuthorizerChanged created and stored", () => {
    assert.entityCount("AuthorizerChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AuthorizerChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newAuthorizer",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
