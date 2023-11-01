CREATE OR ALTER PROCEDURE registerUser(
    id VARCHAR(20),
    fullName VARCHAR(300),
    email VARCHAR(100),
    password VARCHAR(200)
)

AS
BEGIN
    INSERT INTO projectManagement(id, email, fullName, email, password)
    VALUES(@id, @email, @fullName, @email, @password)
END