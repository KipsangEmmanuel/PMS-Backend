CREATE OR ALTER PROCEDURE loginUser(@email VARCHAR(200), @password VARCHAR(200))
AS
BEGIN

    SELECT * FROM Users WHERE email= @email

END