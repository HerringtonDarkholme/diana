interface PrimaryIdType {
}
declare const PrimaryId: PrimaryIdType

function Dictionary() {
}

interface StrType {
}
declare const Str: StrType

function Int() {
}

function Decimal() {
}

interface ListType {
  of<T>(t: { new(): T }): T[]
}
declare const List: ListType

export class User {
  id = PrimaryId
  firstName = Str
  lastName = Str
  age = Int
  extra = Dictionary()
  friends = List.of(User)
  get fullName() {
    return this.firstName + ' ' + this.lastName
  }
}
