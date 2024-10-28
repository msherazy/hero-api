class UserDto {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  isValid() {
    return this.name && this.email && this.password;
  }
}

module.exports = UserDto;
